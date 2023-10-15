import React, { useState, useEffect } from 'react';
import '../css/fonts.css';
// import qrcode from 'qrcode';
import { getPokemonURLName } from '../utils/roster-utils';
import pokemonJson from '../../static/pokemon.json';

function loadImage(url, callback) {
  const img = new Image();
  img.setAttribute('crossorigin', 'anonymous');
  img.onload = () => callback(null, img);
  img.onerror = (error) => callback(error, null);
  img.src = url;
}

function customSort(arr) {
  // Sort the array in ascending order based on the 'value' property
  arr.sort((a, b) => a.value - b.value);

  const sortedArr = [];
  const n = arr.length;
  let left = 0;
  let right = Math.floor((n + 1) / 2);

  while (left < (n) / 2) {
    // Take the left element
    if (arr[left] === undefined) {
      break;
    }
    sortedArr.push(arr[left]);
    // Take the right element (if it's not the same as the left element
    if (arr[right] === undefined) {
      break;
    }
    sortedArr.push(arr[right]);

    left += 1;
    right += 1;
  }

  return sortedArr;
}

function generateImage(profile, season, callback) {
  const canvas = document.createElement('canvas');

  const filteredTournaments = profile.tournaments.filter(
    (tournament) => tournament.tournament.toLowerCase().includes(season),
  );
  const isBig = filteredTournaments.length >= 4;

  function parseDateDDMMYY(dateString) {
    const [day, month, year] = dateString.split('/');
    const parsedDate = new Date(`20${year}`, month - 1, day);
    return parsedDate;
  }

  // Create a shallow copy to avoid modifying the original array directly
  let sortedTournaments = profile.tournaments.slice();

  sortedTournaments = sortedTournaments.filter(
    (tournament) => tournament.tournament.includes(season),
  );

  sortedTournaments.sort((a, b) => {
    const dateA = parseDateDDMMYY(a.date);
    const dateB = parseDateDDMMYY(b.date);

    return dateA - dateB;
  });

  canvas.width = 1200;
  if (sortedTournaments.length <= 8) {
    canvas.height = 1200;
  } else {
    canvas.height = Math.max(1200, 550 + (Math.ceil(sortedTournaments.length / 2) * 170));
  }
  const context = canvas.getContext('2d');

  // // Generate the QR code for the profile URL
  // const profileUrl = `https://www.dracoviz.com/profile/${profile.name}`;
  // const qrCodeSize = 300; // Adjust the size as needed

  // Create a canvas element for the QR code
  // const qrCodeCanvas = document.createElement('canvas');
  // qrCodeCanvas.width = qrCodeSize;
  // qrCodeCanvas.height = qrCodeSize;
  // const qrCodeContext = qrCodeCanvas.getContext('2d');

  const font = new FontFace('MyFont', "url(/myfont.ttf) format('truetype')", {
    family: 'MyFont',
    style: 'normal',
    weight: '400',
  });
  const font2 = new FontFace('MyFont2', "url(/myfont2.ttf) format('truetype')", {
    family: 'MyFont2',
    style: 'normal',
    weight: '400',
  });
  // Load the
  font.load().then((loadedFont) => {
    font2.load().then((loadedFont2) => {
      document.fonts.add(loadedFont);
      document.fonts.add(loadedFont2);
      document.fonts.ready.then(() => {
        // Load the background image
        const backgroundImage = new Image();
        backgroundImage.setAttribute('crossorigin', 'anonymous');
        backgroundImage.crossOrigin = 'anonymous';
        // backgroundImage.src = '/content/assets/profilebackground.png';
        backgroundImage.src = 'https://i.ibb.co/5FF0pnd/IMG-4904.jpg';
        backgroundImage.onload = () => {
          // Draw the background image
          context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
          // canvas.width = 1200;
          // canvas.height = 1200;

          // Generate the QR code image
          // qrcode.toCanvas(qrCodeCanvas, profileUrl, { errorCorrectionLevel: 'H' }, (error) => {
          //   if (error) {
          //     console.error('Error generating QR code:', error);
          //     return;
          //   }

          //   // Draw the QR code onto the main canvas
          //   const qrCodeX = (canvas.width - qrCodeSize) / 2;
          //   const qrCodeY = canvas.height - qrCodeSize - 30;
          //   context.drawImage(qrCodeCanvas, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

          // });

          // Set the font style
          context.font = '75px MyFont';

          let textWidth = context.measureText(profile.name).width;

          // Calculate the x-coordinate to center the text
          let x = (canvas.width - textWidth) / 2;

          // Draw the username
          context.fillStyle = 'white';
          context.fillText(profile.name, x, 115);

          context.font = '60px MyFont';

          let x1 = 0;
          let y1 = 200;
          let x2 = 400;
          let y2 = 200;
          let x3 = 400;
          let y3 = 255;
          let x4 = 0;
          let y4 = 255;

          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.lineTo(x3, y3);
          context.lineTo(x4, y4);
          context.closePath(); // Close the path to form a closed shape
          context.fillStyle = 'white'; // Set the fill color
          context.fill(); // Fill the shape

          context.font = '40px MyFont2';
          textWidth = context.measureText('PLAYER PERFORMANCE').width;
          context.fillText('PLAYER PERFORMANCE', 600, 240);
          x1 = 600;
          y1 = 250;
          x2 = 1200;
          y2 = 250;
          x3 = 1200;
          y3 = 258;
          x4 = 607;
          y4 = 258;

          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.lineTo(x3, y3);
          context.lineTo(x4, y4);
          context.closePath(); // Close the path to form a closed shape
          context.fillStyle = 'white'; // Set the fill color
          context.fill(); // Fill the shape

          context.font = '40px MyFont2';
          context.fillStyle = '#1F1F21';
          textWidth = context.measureText(`${season} SEASON`).width;
          x = (canvas.width - textWidth) / 2;
          context.fillText(`${season} SEASON`, 65, 242);
          context.fillStyle = 'white';

          const championshipImage = new Image();
          championshipImage.onload = () => {
            context.drawImage(championshipImage, 325, 160, 160, 130);
          };

          // Set the font style
          context.font = '30px MyFont';

          const profileDisplay = `www.dracoviz.com/profile/${profile.name}`;
          textWidth = context.measureText(profileDisplay).width;

          // Calculate the x-coordinate to center the text
          x = (canvas.width - textWidth) / 2;

          // Draw the username
          context.fillStyle = 'white';
          context.fillText(profileDisplay, x, canvas.height - 50);

          if (isBig) {
            sortedTournaments = customSort(sortedTournaments);
          }

          if (profile.tournaments && profile.tournaments.length > 0) {
            let yOffset = isBig ? 300 : 350; // Initialize yOffset for the first tournament
            let isRight = false;

            const processTournament = (tournamentIndex) => {
              if (tournamentIndex >= sortedTournaments.length) {
                // All tournaments have been processed, call the callback
                callback(null, canvas.toDataURL('image/png'));
                return;
              }

              const tournament = sortedTournaments[tournamentIndex];
              if (!tournament.tournament.includes(season)) {
                processTournament(tournamentIndex + 1);
                return;
              }
              const tournamentName = tournament.tournament
                .replaceAll('-', ' ')
                .toLowerCase()
                .replaceAll(' laic', ' LAIC')
                .replaceAll(' euic', ' EUIC')
                .replaceAll(' naic', ' NAIC')
                .replaceAll(' ocic', ' OCIC')
                .replaceAll(' lcq', ' LCQ')
                .substring(5)
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ');

              // Draw the tournament name
              context.fillStyle = 'white';
              context.font = '40px MyFont';

              textWidth = context.measureText(tournamentName).width;
              let centerX = !isBig ? (canvas.width - textWidth) / 2 : (isRight ? 600 : 75) + 50;

              context.fillText(tournamentName, centerX, yOffset + 42);

              function ordinal_suffix_of(i) {
                const j = i % 10;
                const k = i % 100;
                if (j === 1 && k !== 11) {
                  return `${i}st`;
                }
                if (j === 2 && k !== 12) {
                  return `${i}nd`;
                }
                if (j === 3 && k !== 13) {
                  return `${i}rd`;
                }
                return `${i}th`;
              }
              const tournamentStats = `${tournament.date.substring(3)} ${
                ordinal_suffix_of(parseInt(tournament.final_rank, 10))
              } ${parseInt(tournament.match_wins, 10)}-${parseInt(tournament.match_losses, 10)}${
                parseInt(tournament.game_wins, 10) >= 0 && parseInt(tournament.game_losses, 10) >= 0
                  ? ` (${parseInt(tournament.game_wins, 10)}-${parseInt(tournament.game_losses, 10)})`
                  : ''
              }`;

              context.font = '30px MyFont';

              // Draw the roster images for this tournament
              const { roster } = tournament;

              textWidth = context.measureText(tournamentStats).width;
              centerX = !isBig ? (canvas.width - textWidth) / 2 : (isRight ? 600 : 75) + 50;
              context.fillText(tournamentStats, centerX, yOffset + (roster && roster.length > 0 ? 145 : 100));


              if (roster && roster.length > 0) {
                let xOffset = isBig ? 50 : 0; // Adjust the X-coordinate for roster display

                const loadRosterImages = (index) => {
                  if (index >= roster.length) {
                    // All images in the roster have been loaded
                    // Move to the next line
                    xOffset = 100;
                    if (!isRight || !isBig) {
                      yOffset += 170;
                    } // Adjust the Y-coordinate for the next row
                    processTournament(tournamentIndex + 1); // Process the next tournament
                    return;
                  }

                  const pokemon = roster[index];
                  const pokemonJsonSid = pokemonJson[getPokemonURLName(pokemon)];
                  let imageUrl = 'https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/2da163c6-167f-4b7d-5e3d-bbc5cf178b00/public';
                  // if (pokemon.name.includes("a")) {
                  if (pokemonJsonSid != null && pokemonJsonSid.sid != null) {
                    imageUrl = `https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${pokemonJsonSid.sid}.png/public`;
                  }
                  // const imageUrl = `https://img.pokemondb.net/sprites/go/normal/${getPokemonURLName(pokemon)}.png`;

                  loadImage(imageUrl, (error, image) => {
                    if (error) {
                      console.error('Error loading image:', error);
                      return;
                    }

                    // Calculate the total width of the roster images when isBig is false
                    // Assuming each image has a width of 70
                    let totalRosterWidth = roster.length * 64;

                    if (!isBig) {
                      totalRosterWidth += (roster.length - 1) * 6; // Add spacing between images
                    }

                    // Calculate the x-coordinate for drawing the image to center them horizontally
                    const imageX = isBig
                      ? xOffset + (!isRight ? 600 : 75)
                      : (canvas.width - totalRosterWidth) / 2 + xOffset;

                    const shadowImage = new Image();
                    shadowImage.onload = () => {
                      // Draw the image
                      context.save();
                      context.beginPath();
                      context.arc(imageX + 34, yOffset + 85, 30, 0, 2 * Math.PI);
                      context.fillStyle = 'lightblue';
                      context.fill();
                      context.strokeStyle = 'white';
                      context.lineWidth = 3;
                      context.stroke();
                      context.closePath();
                      context.clip();

                      // Draw the image inside the circle
                      let zoomFactor = 0.14; // Adjust the zoom factor as needed
                      const tallBois = {
                        Dragonite: 10,
                        Deoxys: 10,
                        Dewgong: 5,
                        Walrein: 5,
                        Registeel: -5,
                        Cresselia: 5,
                        Noctowl: 5,
                        Runerigus: -5,
                        Pelipper: 10,
                        Serperior: 10,
                      };
                      let tallBoi = tallBois[pokemon.name] != null
                        ? tallBois[pokemon.name] : 0; // he zoomin in

                      if (pokemonJsonSid == null) { //missingno offset
                        zoomFactor = 0.37;
                        tallBoi = -3;
                      }

                      const zoomedWidth = image.width * zoomFactor;
                      const zoomedHeight = image.height * zoomFactor;
                      context.drawImage(
                        image,
                        imageX + (34 - zoomedWidth / 2),
                        yOffset + (80 + tallBoi - (zoomedHeight / 2)),
                        zoomedWidth,
                        zoomedHeight,
                      );

                      context.restore();
                      xOffset += 70; // Adjust the X-coordinate for the next image

                      if (pokemon.shadow) {
                        context.drawImage(shadowImage, imageX + 40, yOffset + 85, 30, 30);
                      }
                      loadRosterImages(index + 1); // Load the next image in the roster recursively
                    };
                    shadowImage.setAttribute('crossorigin', 'anonymous');
                    shadowImage.src = 'https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/2fd819c1-f95a-4810-65ac-52c423ae1400/public';
                  });
                };

                // Start loading images for this tournament
                loadRosterImages(0);
              } else {
                // No roster for this tournament, continue to the next
                // xOffset = 100;
                if (!isRight || !isBig) {
                  yOffset += 170;
                } // Adjust the Y-coordinate for the next tournament
                processTournament(tournamentIndex + 1); // Process the next tournament
              }
              isRight = !isRight;
            };

            // Start processing the tournaments
            processTournament(0);
          } else {
            // No tournaments to process, call the callback
            callback(null, canvas.toDataURL('image/png'));
          }

          const dracovizImage = new Image();
          dracovizImage.onload = () => {
            context.drawImage(
              dracovizImage,
              (canvas.width - 300) / 2,
              canvas.height - 150,
              300,
              63,
            );
          };
          championshipImage.setAttribute('crossorigin', 'anonymous');
          dracovizImage.setAttribute('crossorigin', 'anonymous');
          championshipImage.src = 'https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/373dbe60-952c-4bdf-009a-0db41ab3b600/public';
          dracovizImage.src = 'https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/43a7cc83-6e97-4b34-40cc-abcdc6a83f00/public';
        };
      });
    }).catch((error) => {
      console.error('Error loading custom font:', error);
    });
  }).catch((error) => {
    console.error('Error loading custom font:', error);
  });
}

function GenerateLocalImage({ profile, seasons }) {
  if (profile === undefined) {
    return null;
  }
  const [imageUrl, setImageUrl] = useState('');
  const [season, setSeason] = useState(seasons[1]); // Initialize with an empty string

  const handleGraphicSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  useEffect(() => {
    if (season == null) {
      return;
    }

    generateImage(profile, season, (error, image) => {
      if (error) {
        console.error('Error generating image:', error);
      } else {
        setImageUrl(image);
      }
    });
  }, [season]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {imageUrl && (
      <div>
        <select value={season} onChange={handleGraphicSeasonChange} style={{ marginTop: '15px', fontFamily: 'var(--fontFamily-sans)' }}>
          {seasons
            .filter((filteredSeason) => !filteredSeason.includes('All'))
            .map((filteredSeason) => (
              <option key={filteredSeason} value={filteredSeason}>
                {filteredSeason}
                {' '}
                Season
              </option>
            ))}
        </select>
        <br />
        <a href={imageUrl} download={`dracoviz-profile-${profile.name}`}>
          <br />
          <img
            className="profile-image"
            style={{
              marginBottom: 10, maxWidth: 560, width: '100%', objectFit: 'contain',
            }}
            src={imageUrl}
            alt="Player Performance"
          />
          <br />
          <button type="button" className="btn btn-primary">Download Image</button>
        </a>
      </div>
      )}
    </div>
  );
}

export default GenerateLocalImage;