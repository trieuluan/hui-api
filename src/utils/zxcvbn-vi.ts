import type { ZXCVBNFeedback } from "zxcvbn";
import i18next from "i18next";

export function translateZxcvbnFeedback(feedback: ZXCVBNFeedback) {
    return {
        warning: i18next.t(`zxcvbn.warnings.${feedback.warning}`) || feedback.warning,
        suggestions: feedback.suggestions.map(
            (s) => i18next.t(`zxcvbn.suggestions.${s}`) || s
        ),
    };
}
