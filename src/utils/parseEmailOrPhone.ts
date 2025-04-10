import { parsePhoneNumberFromString } from "libphonenumber-js";

export type ParsedInput =
    | { type: "email"; value: string }
    | { type: "phone"; value: string }
    | { type: "invalid" };

export function parseEmailOrPhone(input: string): ParsedInput {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(input)) {
        return { type: "email", value: input };
    }

    const phoneNumber = parsePhoneNumberFromString(input);
    if (phoneNumber && phoneNumber.isValid()) {
        return { type: "phone", value: phoneNumber.number };
    }

    return { type: "invalid" };
}
