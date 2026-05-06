const fs = require('fs');
const FILE_PATH = './system_configs.json';

function loadConfigs() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            fs.writeFileSync('./system_configs.json', '{}');
            return {};
        };
        const data = fs.readFileSync(FILE_PATH, 'utf8');

        if (!data.trim()) {
                return {};
        }

        return JSON.parse(data);
    } catch (e) {
        console.error('JSON 파싱 에러 (파일이 깨졌을 수 있음):', e);
        return {};
    }

}

function saveConfigs(configs) {
    fs.writeFileSync (FILE_PATH, JSON.stringify(configs, null, 2));
}

module.exports = { loadConfigs, saveConfigs };