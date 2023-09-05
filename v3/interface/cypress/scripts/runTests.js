import { exec } from 'child_process'
const accountPhrase = 'side harbor gadget kidney usual month extra invest subject turn drift add survey armor frog riot uncover pill inmate chief depart brave bounce able pitch'

const args = process.argv.slice(2);
let script = 'npm run test:e2e'
if (args.length > 0) {
    if (args[0] === 'recording') {
        script = 'react-app-rewired start'
    } else {
        script = `start-server-and-test 'react-app-rewired start' 3000 'cypress run --browser=chrome --spec=cypress/integration/${args[0]}.spec.js'`
    }
}

const command = `REACT_APP_SELECTED_NETWORK='ALGO-testnet' REACT_APP_TEST_ACCOUNT_PHRASE='${accountPhrase}' REACT_APP_RUNNING_TESTS=true ${script}`
console.log(command)
const execProcess = exec(command)
execProcess.stdout.on('data', (data) => {
    console.log(data)
})

execProcess.stdout.on('close', (code) => {
    console.log('Test Run Complete')
    process.exit(0)
});
