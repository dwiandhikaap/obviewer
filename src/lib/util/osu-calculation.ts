function getPlayfieldScale(screenWidth: number, screenHeight: number): number {
    const widthRatio = screenWidth / 512;
    const heightRatio = screenHeight / 384;

    return Math.min(widthRatio, heightRatio);
}

function calculateFitRatio(fromWidth: number, fromHeight: number, toWidth: number, toHeight: number) {
    const widthRatio = fromWidth / toWidth;
    const heightRatio = fromHeight / toHeight;

    return Math.min(widthRatio, heightRatio);
}

export { getPlayfieldScale, calculateFitRatio };
