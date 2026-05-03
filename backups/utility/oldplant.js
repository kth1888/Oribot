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
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
            });
            const html = await response.text();
            const $ = cheerio.load(html);
            console.log(html);
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