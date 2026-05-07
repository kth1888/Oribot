const configManager = require('../configmanager.js');
const { getPowerStatus } = require('../services/getserverstatus.js');

async function alertLowBattery(client) {
    console.log('--- 배터리 상태 체크 시작 ---');

    const configs = configManager.loadConfigs();
    if (!configs || Object.keys(configs).length === 0) {
        return;
    }
    const powerStatus = await getPowerStatus();

    for (const managerId in configs) {
        const manager = configs[managerId];
        if (manager.powerAlarm && manager.powerAlarm.targetChannel) {
            try {
                if (powerStatus.batteryLevel <= 25 && powerStatus.powerType === 'Battery Power' && manager.powerAlarm.isAlertSent !== true) {
                    const channel = await client.channels.fetch(manager.powerAlarm.targetChannel);
                    if (channel) {
                        await channel.send(`⚠️**[경고]** \n 서버 배터리가 ${powerStatus.batteryLevel}% 남았습니다. 전원을 연결해주세요.`);
                        manager.powerAlarm.isAlarmSent = true;
                        configManager.saveConfigs(configs);
                    }
                } else if (powerStatus.chargeType === 'AC Power' && manager.powerAlarm.isAlertSent === true) {
                    manager.powerAlarm.isAlertSent = false;
                    configManager.saveConfigs(configs);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
}

module.exports = { alertLowBattery };