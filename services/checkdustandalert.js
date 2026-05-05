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

        const previousDustGrade = userConfig.munjiAlarm.currentDustGrade;
        const userDustGrade = cv.pm10Grade_whoStandard_eightLevel;
        const canUserVentilate = userDustGrade < 5;
        const isGradeChanged = previousDustGrade != userDustGrade ? true : false;

        if (!userDustGrade || userDustGrade == 0 || !levels[userDustGrade]) {
            if (!isGradeChanged) {
                continue;
            } else {
                await channel.send(`[안내] ${location} 지역은 현재 데이터를 불러올 수 없습니다.`);
                userConfig.munjiAlarm.currentDustGrade = userDustGrade;
                continue;
            }

        }

        userConfig.munjiAlarm.currentDustGrade = userDustGrade;
        if (previousDustGrade === null) {
            if (canUserVentilate) {
                await channel.send(`**${dustData.datatime}** \n** ${location} : 지금 환기 타임!!** **(${levels[userDustGrade].label} ${levels[userDustGrade].emoji})** `);
            } else {
                await channel.send(`**${dustData.datatime}** \n** ${location} : 지금 창문 닫아!!** **(${levels[userDustGrade].label} ${levels[userDustGrade].emoji})** `);
            }
        } else if (canUserVentilate && isGradeChanged) {
                await channel.send(`**${dustData.datatime}** \n** ${location} : 지금 환기 타임!!** **(${levels[userDustGrade].label} ${levels[userDustGrade].emoji})** `);
        } else if (!canUserVentilate && isGradeChanged) {
                await channel.send(`**${dustData.datatime}** \n** ${location} : 지금 창문 닫아!!** **(${levels[userDustGrade].label} ${levels[userDustGrade].emoji})** `);
            }
        }
        db.saveUsers(users);
    }

 module.exports = { checkDustAndAlert };