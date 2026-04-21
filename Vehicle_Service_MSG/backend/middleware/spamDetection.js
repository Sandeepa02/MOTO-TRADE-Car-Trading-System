// Basic spam detection middleware
const detectSpam = (req, res, next) => {
    const { content } = req.body;
    
    if (content) {
        // Rule 1: Too many repeated characters (e.g., "haaaaaallllllooooo")
        const repeatingCharsRegex = /(.)\1{10,}/;
        if (repeatingCharsRegex.test(content)) {
            // Flag as potential spam but might still process it depending on strictness
            req.body.isSpamExpected = true;
        }

        // Rule 2: Suspicious links (e.g. basic check for non-whitelisted domains)
        // Simplified for this requirement
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex);
        if (urls && urls.length > 2) {
            req.body.isSpamExpected = true;
        }

        // Rule 3: Banned words (mock list)
        const bannedWords = ['scam', 'nigerian prince', 'wire transfer', 'cryptocurrency', 'bitcoin'];
        const containsBanned = bannedWords.some(word => content.toLowerCase().includes(word));
        if (containsBanned) {
            req.body.isSpamExpected = true;
        }
    }
    
    next();
};

module.exports = { detectSpam };
