export const generateRandomHash = (hashLength: number) => {
    const selectionString = "qwertyuiopasdfghjklzxcvbnm1234567890"
    let hashedLink = "";
    for (let i = 0;i < hashLength;i++) {
        hashedLink += selectionString[Math.floor(Math.random() * selectionString.length)];
    }
    return hashedLink
}