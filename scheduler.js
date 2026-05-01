const cheerio = require('cheerio');
const cron = require('node-cron');
const { getDustData } = require('./commands/utility/먼지.js');
const db = require('./db.js');

function initScheduledTasks(client) {

    // 잔디심기 알리미
    cron.schedule('0 8-22/2 * * *', () => {
        checkDailyCommit(client);
    });


    // 미세먼지 주기적 알림
    cron.schedule('*/10 9-21 * * *', () => {
        checkDustAndAlert(client);
    });
}

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

async function checkDailyCommit(client) {
    console.log('--- 유저 일일 커밋 체크 ---');

    const today = new Date();
    const date = today.getFullYear() +
	'-' + ((today.getMonth() + 1) < 9 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1)) +
	'-' + ((today.getDate()) < 9 ? '0' + (today.getDate()) : (today.getDate()));
    console.log(date);

    const users = db.loadUsers();

    if (!users || Object.keys(users).length === 0) {
        console.log('알림을 보낼 유저 데이터가 없습니다. 작업을 건너뜁니다.');
        return;
    }

    for (const userId in users) {
        const userConfig = users[userId];
        const userProfileLink = userConfig.githubAlarm.githubLink;
        const targetChannelId = userConfig.githubAlarm.targetChannelId;
        const channel = await client.channels.fetch(targetChannelId);
        // pass if user not set an github link
        if (!userProfileLink) {
            continue;
        }

        try {
            const response = await fetch(userProfileLink, {
                'method': 'GET',
            });
            const html = await response.text();
            const $ = cheerio.load(html);
            let level = 0;
            const targetDay = $(`td[data-date='${date}']`);
            if (targetDay.length > 0) {
                level = targetDay.attr('data-level');
            }

            if (level == 0) {
                await channel.send(`**${date}** \n 오늘 올라온 커밋이 없습니다.`);
            }

        } catch (error) {
            console.error(error);
        }
    }
}


module.exports = { initScheduledTasks };

// 알림 받을 채널 설정 기능
// 알림 가는 시간 조정 기능 ( 9 to 9 )
// cron delay settings : https://goodgirlgonebad.tistory.com/79
// https://velog.io/@jay2u8809/Crontab%ED%81%AC%EB%A1%A0%ED%83%AD-%EC%8B%9C%EA%B0%84-%EC%84%A4%EC%A0%95
// 0 */1 * * * : 매 정각마다 실행, 0,10,20,30,40,50 * * * * : 매 10분마다 실행