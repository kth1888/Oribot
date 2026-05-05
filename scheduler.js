const cron = require('node-cron');
const { checkDustAndAlert } = require('./services/checkdustandalert.js');
const { checkDailyCommit } = require('./services/checkdailycommit.js');


function initScheduledTasks(client) {
    // Test space (instant run)
    // checkDustAndAlert(client);

    // 잔디심기 알리미 0 8-22/2 * * * // 1분간격(테스트용) : * * * * *
    cron.schedule('0 8-22/2 * * *', () => {
        checkDailyCommit(client);
    });


    // 미세먼지 주기적 알림
    cron.schedule('*/10 9-21 * * *', () => {
        checkDustAndAlert(client);
    });
}

module.exports = { initScheduledTasks };

// 알림 가는 시간 조정 기능 ( 9 to 9 )
// cron delay settings : https://goodgirlgonebad.tistory.com/79
// https://velog.io/@jay2u8809/Crontab%ED%81%AC%EB%A1%A0%ED%83%AD-%EC%8B%9C%EA%B0%84-%EC%84%A4%EC%A0%95
// 0 */1 * * * : 매 정각마다 실행, 0,10,20,30,40,50 * * * * : 매 10분마다 실행