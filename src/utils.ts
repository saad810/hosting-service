const MAX_ID_LENGTH = 5;
export function generateRandomId(){
    let ans = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < MAX_ID_LENGTH; i++) {
        ans += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return ans;
}