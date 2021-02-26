 const axios = require('axios');
const config = require('../config/config');


exports.getGames = async (req, res) => {

    const token = req.token.access_token;
    const io = req.io;
  //

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['Client-ID'] =  config.client_id;

    // let games_array;
    const url = encodeURI('https://api.twitch.tv/helix/games?name=Rainbow Six Siege&name=Far Cry 5&name=Assassin\'s Creed: Odyssey');
    const games_array = (await axios.get(url)).data.data;
    const counter_game = games_array.find(a => a.name === 'Tom Clancy\'s Rainbow Six Siege');

    getCounter(token, counter_game, io).catch(err => {
        console.log('getCounter', err);
    });
    //
    getCounterForChart(games_array, token, io)
        .catch(error => console.log('getCounterForChart', error));

}


 const getCounter = async (token, game_data, io)=> {
    let result = await getGameData('', token, 0, game_data);
    if (result && token) getCounter(token, game_data, io).catch(err => console.log(err));
    io.emit('getCounter', result);
}

const getCounterForChart = async (array_games, accessToken, io) => {
    let result;
    let resultArray = [];
    for (let i = 0; i < array_games.length; i++) {

        result = await getGameData('', accessToken, 0, array_games[i]);
        result.date = new Date();
        resultArray.push(result)
    }
    const date = new Date().getTime();
    const resData = resultArray.map(game => {

        return {
            date: date,
            name: game.game_data.name,
            id: game.game_data.id,
            counter: game.counter
        }
    });

    io.sockets.emit('getChartData_new', resData);
    if (result && accessToken) {
        getCounterForChart(array_games, accessToken, io).catch(err => console.log(err));

    }
}

const getGameData = async (newCursor, accessToken, counter, game_data) => {

    const url = `https://api.twitch.tv/helix/streams?first=100&game_id=${game_data.id}&after=${newCursor}`;
    try {

        const response = await axios.get(url).catch(err => console.log('getGameData ERROR', err));
        counter += response.data.data.reduce((prev, cur) => prev + cur.viewer_count, 0);

        if (response && response.data.pagination.cursor) {
            return getGameData(response.data.pagination.cursor, accessToken, counter, game_data);
        }
        return {counter: counter, game_data: game_data};

    } catch (error) {
        console.error(error);
    }

}
