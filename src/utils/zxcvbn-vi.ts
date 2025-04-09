import type { ZXCVBNFeedback } from "zxcvbn";

const warningMap: Record<string, string> = {
    "This is a top-10 common password": "Đây là mật khẩu phổ biến top 10.",
    "This is a top-100 common password": "Đây là mật khẩu phổ biến top 100.",
    "This is a very common password": "Đây là một mật khẩu rất phổ biến.",
    "This is similar to a commonly used password": "Mật khẩu này tương tự với mật khẩu phổ biến.",
    "A word by itself is easy to guess": "Một từ đơn lẻ rất dễ đoán.",
    "Names and surnames by themselves are easy to guess": "Tên và họ riêng lẻ rất dễ đoán.",
};

const suggestionMap: Record<string, string> = {
    "Add another word or two. Uncommon words are better.":
        "Thêm một hoặc hai từ nữa. Từ ít phổ biến sẽ tốt hơn.",
    "Use a longer keyboard pattern with more turns":
        "Sử dụng chuỗi phím dài hơn và thay đổi hướng nhiều hơn.",
    "Avoid repeated words and characters":
        "Tránh lặp lại từ hoặc ký tự.",
    "Avoid sequences": "Tránh chuỗi lặp như 'abcd' hoặc '1234'.",
    "Avoid recent years": "Tránh sử dụng các năm gần đây.",
    "Avoid years that are associated with you":
        "Tránh dùng năm gắn liền với bạn (như năm sinh).",
    "Avoid dates and years that are associated with you":
        "Tránh sử dụng ngày tháng hoặc năm liên quan đến bạn.",
    "Capitalization doesn't help very much":
        "Viết hoa không làm mật khẩu mạnh hơn đáng kể.",
    "All-uppercase is almost as easy to guess as all-lowercase":
        "Tất cả chữ in hoa cũng dễ đoán như chữ thường.",
    "Reversed words aren't much harder to guess":
        "Đảo ngược từ không làm nó khó đoán hơn nhiều.",
    "Substituting symbols for letters (e.g. '@' instead of 'a') doesn't help very much":
        "Thay ký tự đặc biệt như '@' cho 'a' không giúp tăng bảo mật đáng kể.",
};

export function translateZxcvbnFeedback(feedback: ZXCVBNFeedback) {
    return {
        warning: warningMap[feedback.warning] || feedback.warning,
        suggestions: feedback.suggestions.map(
            (s) => suggestionMap[s] || s
        ),
    };
}
