export function generateAccno(): number {
    let accountNumber = '';
    for (let i = 0; i < 7; i++) {
        accountNumber += Math.floor(Math.random() * 10);
    }
    // console.log("Generated Account Number:", accountNumber);
    return parseInt(accountNumber);
}

