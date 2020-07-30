REM First time run only
REM npm init -y
REM npm install babel-cli@6 babel-preset-react-app@3

npx babel --watch src/jsx --out-dir webroot/static --presets react-app/prod 