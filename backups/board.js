const cron = require('node-cron');
const { getDustData } = require('./commands/utility/먼지.js');
const db = require('./db.js');

const testTargetChannelId = '1498606841746292777';

function initScheduledTasks(client) {

    // 미세먼지 주기적 알림
    cron.schedule('0,10,20,30,40,50 * * * *', () => {
        if (testTargetChannelId) {
            checkDustAndAlert(client);
        }
    });
}

async function checkDustAndAlert(client) {
    console.log('--- 주기적 미세먼지 체크 시작 ---');

    const dustData = await getDustData();
    const levels = dustData.whoLevels;
    const users = db.loadUsers();
    const channel = await client.channels.fetch(testTargetChannelId);

    for (const userId in users) {
        const userConfig = users[userId];
        const location = userConfig.userLocation;
        const targetChannelId = userConfig.channelLocation;
        const cv = dustData.info.data[location];

        if (!cv) {
            console.log(`[경고] ${location} 지역 데이터를 찾을 수 없어 건너뜁니다.`);
            continue;
        }

        const previousDustGrade = userConfig.currentDustGrade;
        const userDustGrade = cv.pm10Grade_whoStandard_eightLevel;
        const canUserVentilate = userDustGrade < 5;
        const isGradeChanged = previousDustGrade != userDustGrade ? true : false;

        if (!userDustGrade || userDustGrade == 0 || !levels[userDustGrade]) {
            if (!isGradeChanged) {
                continue;
            } else {
                await channel.send(`[안내] ${location} 지역은 현재 데이터를 불러올 수 없습니다.`);
                userConfig.currentDustGrade = userDustGrade;
                continue;
            }

        }


        userConfig.currentDustGrade = userDustGrade;
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


module.exports = { initScheduledTasks };

// 알림 받을 채널 설정 기능
// 알림 가는 시간 조정 기능 ( 9 to 9 )
// cron delay settings : https://goodgirlgonebad.tistory.com/79
// https://velog.io/@jay2u8809/Crontab%ED%81%AC%EB%A1%A0%ED%83%AD-%EC%8B%9C%EA%B0%84-%EC%84%A4%EC%A0%95
// 0 */1 * * * : 매 정각마다 실행, 0,10,20,30,40,50 * * * * : 매 10분마다 실행