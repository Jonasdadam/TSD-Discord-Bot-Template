require("colors");

module.exports = async (client) => {
  
  const asciiArt = `
  ____                   ____             
 / ___| _   _ _ __ __  _|  _ \\  _____   __
 \\___ \\| | | | '_ \\\\ \\/ / | | |\/ _ \\ \\ / /
  ___) | |_| | | | |>  <| |_| |  __/\\ V / 
 |____/ \\__, |_| |_/_/\\_\\____/ \\___| \\_/  
        |___/                              
`;

  console.log(asciiArt.blue);
  console.log(`🤖 ${client.user.username} is online.\n`.blue);
};
