const whoLevels = {
    0: { label: '측정불가', emoji: '⚪' },
    1: { label: '최고 좋음', emoji: '💙' },
    2: { label: '좋음', emoji: '🤍' },
    3: { label: '양호', emoji: '💚' },
    4: { label: '보통', emoji: '💛' },
    5: { label: '그저그럼', emoji: '🧡' },
    6: { label: '나쁨', emoji: '🔴' },
    7: { label: '매우 나쁨', emoji: '🚫' },
    8: { label: '최악', emoji: '💀' },
};

async function getDustData() {
    let dustInfo, dustgrade, canVentilate, result, formattedTime;
    try {
        const response = await fetch('https://s3.ap-northeast-2.amazonaws.com/misemise-fine-dust-data/current-data/map-data/data.json', {
            'headers': {
                'accept': 'application/json',
                'Referer': 'https://www.misemise.co.kr/',
            },
            'method': 'GET',
            });
        result = await response.json();

        const location = '성북구';
        dustInfo = result.data[location];

        if (!dustInfo) {
            console.log(`'${location}'에 대한 정보를 찾을 수 없습니다.`);
            return null;
        }

        dustgrade = dustInfo.pm10Grade_whoStandard_eightLevel;

        canVentilate = dustgrade < 5;

        const updateDate = new Date(result.data_info.updateTime);

        // 포맷팅: "오후 10시 30분"
        formattedTime = updateDate.toLocaleString('ko-KR', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });


    } catch (error) {
        console.error(error);
    }

    return {
        info: result,
        value: dustInfo.pm10Value,
        grade: dustgrade,
        canVentilate: canVentilate,
        datatime: `${formattedTime}`,
        whoLevels: whoLevels,
    };

};

module.exports = { getDustData };