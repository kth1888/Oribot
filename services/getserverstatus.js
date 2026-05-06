const { execSync } = require('child_process');

const var1 = 'Now drawing from \'AC Power\' \n -InternalBattery-0 (id=25362531)    61%; charging; 1:37 remaining present: true';
const var2 = 'Now drawing from \'Battery Power\' \n -InternalBattery-0 (id=25362531)    23%; discharging; 1:37 remaining present: true';
const var3 = 'Now drawing from \'Battery Power\' \n -InternalBattery-0 (id=25362531)    100%; charged; 0:00 remaining present: true';

function getPowerStatus() {
    try {
        let batteryLevel, powerType, powerStatus;
        const result = execSync('pmset -g batt').toString();

        const regex1 = /(\d+)%/;
        const match1 = result.match(regex1);
        if (match1) {
            batteryLevel = parseInt(match1[1], 10);
        }

        // was /(\w+\s\w+)'/
        const regex2 = /'([^']+)'/;
        const match2 = result.match(regex2);
        if (match2) {
            powerType = match2[1];
        }

        const regex3 = /(dis)?charg[\w]+/;
        const match3 = result.match(regex3);
        if (match3) {
            powerStatus = match3[0];
        }

        console.log(`Power Status: ${powerType}, ${batteryLevel}% (${powerStatus})`);

        return {
            powerType: powerType,
            batteryLevel: batteryLevel,
            powerStatus: powerStatus,
        };
    } catch (e) {
        console.error(e);
    }
}

module.exports = { getPowerStatus };

getPowerStatus();