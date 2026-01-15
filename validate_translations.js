
import { th, en } from './src/data/translations.js';

console.log("Loading translations...");

try {
    // Check key structure existence
    const checkKeys = (lang, langName) => {
        if (!lang.resume.experience) throw new Error(`${langName} missing resume.experience`);
        if (!lang.resume.experience.freelance) throw new Error(`${langName} missing resume.experience.freelance`);
        if (!lang.resume.experience.assistantManager) throw new Error(`${langName} missing resume.experience.assistantManager`);
        if (!lang.resume.experience.eventCoordinator) throw new Error(`${langName} missing resume.experience.eventCoordinator`);
        if (!lang.resume.experience.contentCreatorPermanent) throw new Error(`${langName} missing resume.experience.contentCreatorPermanent`);
        if (!lang.resume.experience.contentCreatorPartTime) throw new Error(`${langName} missing resume.experience.contentCreatorPartTime`);
        if (!lang.resume.experience.editorContract) throw new Error(`${langName} missing resume.experience.editorContract`);

        // Check deep keys used in Resume.jsx
        if (!lang.resume.experience.freelance.title) throw new Error(`${langName} missing freelance.title`);

        // Check timeline used in App.jsx
        if (!lang.experience.timeline) throw new Error(`${langName} missing experience.timeline`);
        if (lang.experience.timeline.length < 7) throw new Error(`${langName} experience.timeline too short (MainPortfolio uses index 6)`);
        if (!lang.experience.timeline[6].title) throw new Error(`${langName} missing timeline[6].title`);

        console.log(`${langName} passed structure check.`);
    };

    checkKeys(th, "TH");
    checkKeys(en, "EN");

    console.log("SUCCESS: Translations are valid.");
} catch (error) {
    console.error("FAILURE:", error.message);
    process.exit(1);
}
