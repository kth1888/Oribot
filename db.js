const fs = require('fs');
const FILE_PATH = './user_configs.json';

function loadUsers() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            fs.writeFileSync('./user_configs.json', '{}');
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

function saveUsers(users) {
    fs.writeFileSync (FILE_PATH, JSON.stringify(users, null, 2));
}

module.exports = { loadUsers, saveUsers };