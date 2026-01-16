export const resumeContext = {
    personalInfo: {
        name: "Pornpon Thanasuwanthat",
        nickname: "Boss",
        age: 32,
        currentRole: "Assistant Manager & Digital Content Specialist",
        location: "Bangkok, Thailand",
        description: "Diverse experience from Production to Management, currently focused on AI Innovation"
    },

    experience: [
        {
            title: "Assistant Manager",
            company: "Hostpital Feelgood Club",
            period: "2025 (6 Months)",
            type: "Full-Time",
            responsibilities: [
                "Managed store operations and events as MC",
                "Led Service, Security, and Host (PR) teams",
                "Handled CRM and on-site problem solving"
            ]
        },
        {
            title: "Event Project Coordinator",
            company: "Joe Luxury Car Service",
            period: "2024 (1 Year)",
            type: "Contract",
            responsibilities: [
                "Coordinated field teams and VIP clients",
                "Managed resources (manpower, vehicles, time)",
                "Primary communication hub for client requirements"
            ]
        },
        {
            title: "Content Creator",
            company: "Saint Thonglor Clinic",
            period: "2020 - 2022",
            type: "Permanent",
            responsibilities: [
                "Planned daily/monthly content and filming schedules",
                "Coordinated with medical teams and marketing agencies"
            ]
        },
        {
            title: "Content Creator",
            company: "U-Turn Shop",
            period: "2020 - 2022",
            type: "Part-Time",
            responsibilities: [
                "Planned and filmed product promo content",
                "Consulted Admin team to improve service"
            ]
        },
        {
            title: "Editor",
            company: "Punnisa Clinic",
            period: "2019 (1 Year)",
            type: "Contract",
            responsibilities: [
                "Edited all motion content for the clinic"
            ]
        }
    ],

    skills: {
        core: [
            "Video Editor",
            "Creative",
            "Photography",
            "Motion Graphic",
            "Coding",
            "English (Read/Write/Speak)",
            "Song Writer"
        ],
        aiTools: [
            "ChatGPT",
            "Gemini",
            "Maus",
            "Claude",
            "Poe",
            "GitHub Copilot",
            "Cursor",
            "Bolt AI"
        ],
        toolsMedia: [
            "Premiere Pro",
            "After Effects",
            "Photoshop",
            "Lightroom",
            "DaVinci Resolve",
            "CapCut"
        ],
        aiInnovation: {
            "Prompt Engineering": "Expert",
            "AI Workflow": "Advanced",
            "LLMs Understanding": "Advanced"
        }
    },

    portfolio: {
        categories: {
            "Motion Graphic": 3,
            "Cinematic & Motion": 4,
            "Beauty": 5,
            "Automotive & Variety": 5,
            "AI & Innovation": 3
        },
        highlights: [
            "Saint Thonglor Clinic - Beauty content (5 works)",
            "Harley-Davidson & Kawasaki - Cinematic motorcycle detailing",
            "U-Turn Shop - Variety show style content",
            "AI Projects - GitHub: agentic_agent (EVA 9.4.0)",
            "Original Music - AI Sound Production"
        ]
    },

    education: {
        university: "Rangsit University",
        degree: "Bachelor of Communication Arts (Advertising)",
        highSchool: "Suankularb Wittayalai School"
    },

    currentFocus: {
        area: "AI Innovation & Future Skills",
        description: "Studying and developing AI technology to reduce costs and increase productivity in organizations",
        projects: ["EVA 9.4.0 - Advanced AI Agent Architecture"]
    },

    contact: {
        github: "https://github.com/Freshair129/agentic_agent.git",
        location: "Bangkok, Thailand"
    }
};

export const systemPrompt = `You are Boss's (Pornpon's) personal AI assistant on his portfolio website.
You help visitors learn about Boss's experience, skills, and portfolio works.

About Boss:
- Name: Pornpon "Boss" Thanasuwanthat, 32 years old
- Based in Bangkok, Thailand
- Career journey: Production → Management → AI Innovation
- Current role: Assistant Manager & Digital Content Specialist
- Current focus: Developing Future Skills in AI Innovation

Guidelines:
0. [CRITICAL] IDENTITY CAPTURE & LANGUAGE: **Always respond in Thai (ภาษาไทย)**. In your first message or if user hasn't identified yet, your priority is to find out their NAME and COMPANY. You can say: "ผมอยากรู้จักคุณให้มากขึ้นครับ! ไม่ทราบว่าคุณชื่ออะไร และมาจากบริษัทไหนครับ? (เพื่อให้ผมช่วยจำและเตรียมข้อมูลที่เหมาะกับบริษัทคุณที่สุดครับ)"
1. Be friendly, professional, and warm
2. Detect and respond in the same language as the user (Thai or English)
3. Keep responses concise (2-4 sentences maximum)
4. If asked about specific work experience, mention relevant companies
5. If asked about skills, highlight both creative and AI capabilities
6. If asked about portfolio, mention the variety (Beauty, Cinematic, AI projects)
7. If asked for contact, provide GitHub link and suggest viewing the Resume page
8. If uncertain about specific details, suggest: "You can find more details on the Resume or Portfolio page!"
9. Use a conversational, slightly casual tone (like talking to a potential collaborator)
10. Avoid overly formal language - be personable

Example responses:
- "สวัสดีครับ! ผมคือ AI Assistant ของบอส มีอะไรให้ช่วยไหมครับ?"
- "Boss has 6+ years of experience in content creation and management, working with brands like Saint Thonglor Clinic and luxury car services!"
- "คุณสามารถดูผลงานได้ที่หน้า Portfolio ครับ มีทั้งงาน Beauty, Cinematic, และ AI Innovation!"`;
