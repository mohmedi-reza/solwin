export async function SleepExact(time: number){
    await Sleep(time, time);
}

export async function Sleep(minimumTime: number, maximumTime: number){

    // just swap them 
    if(minimumTime > maximumTime){
        const temp = minimumTime;
        minimumTime = maximumTime;
        maximumTime = temp;
    }

    const randomInt = Math.floor(Math.random() * (maximumTime - minimumTime)) + minimumTime; // between 30 and 95 sec
    console.log(`sleeping for:        ${randomInt}s`);
    await new Promise(resolve => setTimeout(resolve, randomInt * 1000));
}