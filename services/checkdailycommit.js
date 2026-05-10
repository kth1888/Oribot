const db = require('../db.js');

async function checkDailyCommit(client) {
    console.log('--- 유저 일일 커밋 체크 ---');

    const today = new Date();
    const date = today.getFullYear() +
    '-' + ((today.getMonth() + 1) < 9 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1)) +
    '-' + ((today.getDate()) <= 9 ? '0' + (today.getDate()) : (today.getDate()));
    console.log(date);

    const users = db.loadUsers();

    if (!users || Object.keys(users).length === 0) {
        console.log('알림을 보낼 유저 데이터가 없습니다. 작업을 건너뜁니다.');
        return;
    }

    for (const userId in users) {
        const userConfig = users[userId];
        const username = userConfig.githubAlarm.username;
        const userToken = userConfig.githubAlarm.githubToken;
        const targetChannelId = userConfig.githubAlarm.targetChannelId;
        // pass if user not set an github link
        if (!userToken) {
            continue;
        }

        try {
            const response = await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'node-fetch',
                },
                body: JSON.stringify({
                    query: `
                    query($userName:String!) {
                        user(login: $userName) {
                            contributionsCollection {
                                contributionCalendar {
                                    totalContributions
                                    weeks {
                                        contributionDays {
                                            date
                                            contributionLevel
                                        }
                                    }
                                }
                            }
                        }
                    }`,
                    variables: { userName: username },
                }),
            });

            result = await response.json();
            // console.log('API Response:', JSON.stringify(result, null, 2));

            calendar = result
                            .data
                                .user
                                    .contributionsCollection
                                        .contributionCalendar;
            const allDays = calendar.weeks.flatMap(week => week.contributionDays);
            const todayData = allDays.find(day => day.date === date);
            console.log(todayData);

            // 최근 체크한 날짜와 다른 경우 알림이 가도록 commitFinished를 false로 설정
            if (userConfig.githubAlarm.lastChecked !== date) {
                userConfig.githubAlarm.commitFinished = false;
                userConfig.githubAlarm.lastChecked = date;
                db.saveUsers(users);
                console.log(`[정보] ${username}님의 알림 상태가 ${date} 날짜로 초기화되었습니다.`);
            }

            if (todayData) {
                const level = todayData.contributionLevel;
                const channel = await client.channels.fetch(targetChannelId);
                console.log(`오늘(${date})의 기여도 레벨: ${level}`);

                if (level !== 'NONE' && userConfig.githubAlarm.commitFinished !== true) {
                    if (channel) {
                        await channel.send(`**${date}** \n 오늘의 첫 커밋을 확인했습니다! 오늘도 갓생 성공! 🔥`);
                        userConfig.githubAlarm.commitFinished = true;
                        db.saveUsers(users);
                    }

                } else if (level === 'NONE') {
                    await channel.send(`**${date}** \n 오늘 올라온 커밋이 없습니다.`);
                }
            }
        } catch (error) {
                console.error(error);
            }
        }
}

module.exports = { checkDailyCommit };