export function encodeFeatures(data) {
const osCategories = { 'Windows': 1, 'Linux': 2, 'MacOS': 3 };
const browserCategories = { 'Chrome': 1, 'Firefox': 2, 'Safari': 3, 'Edge': 4 };

const osValue = osCategories[data[2]] || 0;
const browserValue = browserCategories[data[3]] || 0;

const sessionDuration = parseInt(data[6].replace('s', ''));

const [hours, minutes] = data[8].split(':').map(Number);
const accessMinutes = hours * 60 + minutes;

return [
    1,                     
    2,                     
    osValue,               
    browserValue,          
    data[4],               
    data[5],               
    sessionDuration,       
    data[7],
    accessMinutes       
];
}