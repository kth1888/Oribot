const db = require('../db.js');
const { getDustData } = require('../services/getdustdata.js');

async function checkDustAndAlert(client) {
    console.log('--- 주기적 미세먼지 체크 시작 ---');

    const dustData = await getDustData();
    const levels = dustData.whoLevels;
    const users = db.loadUsers();

    if (!users || Object.keys(users).length === 0) {
        console.log('알림을 보낼 유저 데이터가 없습니다. 작업을 건너뜁니다.');
        return;
    }

    for (const userId in users) {
        const userConfig = users[userId];
        const location = userConfig.munjiAlarm.userLocation;
        const targetChannelId = userConfig.munjiAlarm.targetChannelId;
        const channel = await client.channels.fetch(targetChannelId);
        const cv = dustData.info.data[location];

        if (!cv) {
            console.log(`[경고] ${location} 지역 데이터를 찾을 수 없어 건너뜁니다.`);
            continue;
        }

        const userDustGrade = cv.pm10Grade_whoStandard_eightLevel;

        // 미세먼지 레벨이 없거나 0이거나 레벨에 해당하는 등급단위가 없는 경우
        if (!userDustGrade || userDustGrade == 0 || !levels[userDustGrade]) {
            if (userConfig.munjiAlarm.hasDataError !== true) {
                await channel.send(`[안내] ${location} 지역은 현재 데이터를 불러올 수 없습니다.`);
                userConfig.munjiAlarm.hasDataError = true;
            }
            continue;
        }

        // 데이터가 정상인 경우 플래그 해제
        userConfig.munjiAlarm.hasDataError = false;

        // 판별식
        const canUserVentilate = userDustGrade < 5;

        if (userConfig.munjiAlarm.wasAirGood === undefined) {
            userConfig.munjiAlarm.wasAirGood = canUserVentilate;
        }
        const wasAirGood = userConfig.munjiAlarm.wasAirGood;

        // 기존에 저장된 불필요한 필드가 있다면 삭제 (마이그레이션)
        if (userConfig.munjiAlarm.currentDustGrade !== undefined) {
            delete userConfig.munjiAlarm.currentDustGrade;
        }

        const isStateChanged = (wasAirGood !== canUserVentilate);

        if (isStateChanged) {
            if (canUserVentilate && !wasAirGood) {
                await channel.send(`**${dustData.datatime}** \n** ${location} : 지금 환기 타임!!** **(${levels[userDustGrade].label} ${levels[userDustGrade].emoji})** `);
            } else if (!canUserVentilate && wasAirGood) {
                await channel.send(`**${dustData.datatime}** \n** ${location} : 지금 창문 닫아!!** **(${levels[userDustGrade].label} ${levels[userDustGrade].emoji})** `);
            }
            userConfig.munjiAlarm.wasAirGood = canUserVentilate;
        }
    }
    db.saveUsers(users);
}

 module.exports = { checkDustAndAlert };