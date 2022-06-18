export default (scenes) => {
    const scenesArr = [];
    for (let sceneKey in scenes) {
        if(!scenes.hasOwnProperty(sceneKey) || !scenes[sceneKey].enabled) continue;
        scenes[sceneKey].key = sceneKey;
        scenesArr.push(scenes[sceneKey]);
    }
    scenes = scenesArr.filter(scene => scene.enabled);

    // This function we use in order to determine the amount decimal numbers
    const decimalCount = num => num.toString().includes('.') ? num.toString().split('.').pop().length : 0;
    // Convert frequency strinпg value to float
    let scenesRate = scenes
        .map(scene => parseFloat(scene.frequency))
    // Determining max decimal value in rates for exponentiation the numbers
    let maxDecimal = 0;
    scenesRate.forEach(rate => {
        if(decimalCount(rate) > maxDecimal) {
            maxDecimal = decimalCount(rate)
        }
    });
    // Converting float to an integer with compliance ratio
    scenesRate = scenesRate.map(rate => rate * 10 ** maxDecimal)
    // Sorting from the smallest to the largest. We need to find the smalled number for reducing on rates
    // For example: [5, 10, 100] to [1, 2, 10]. This is helps to remove extra values that don't affect the ratio
    const minRate = [...scenesRate].sort((a, b) => a - b)[0];
    let reduceInt = 1;
    for(let i = minRate; i > 0; i--) {
        if(scenesRate.length === scenesRate.filter(rate => rate % i === 0).length) {
            reduceInt = i;
            break;
        }
    }
    // Reducing
    scenesRate = scenesRate.map(rate => rate / reduceInt);
    // Generating array with values with chance ratio
    let container = [];
    scenes.forEach((scene, index) => {
        const chance = scenesRate[index];
        for (let i = 0; i < chance; i++) {
            container.push(scene.key);
        }
    });
    // Getting random item from array
    return container[Math.floor(Math.random() * container.length)];
}