"""Portfolio-owned lifecycle wrapper; upstream worker blobs remain unchanged.

The upstream worker sweeps on intake/startup, not periodically. Sweep every two
seconds so an idle worker cannot retain abandoned media past the declared TTL.
"""
import asyncio
from app.voice_worker.runtime import WorkerRuntime
from app.voice_worker.timeutil import utc_now
from app.voice_worker.__main__ import main

_start = WorkerRuntime.startup
_stop = WorkerRuntime.shutdown

async def sweep(runtime):
    while True:
        runtime._sweep(utc_now())
        await asyncio.sleep(2)

async def start(runtime):
    runtime._sweep(utc_now())
    await _start(runtime)
    runtime.portfolio_sweep = asyncio.create_task(sweep(runtime))

async def stop(runtime):
    task = getattr(runtime, 'portfolio_sweep', None)
    if task:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
    await _stop(runtime)

WorkerRuntime.startup = start
WorkerRuntime.shutdown = stop
if __name__ == '__main__':
    raise SystemExit(main())
