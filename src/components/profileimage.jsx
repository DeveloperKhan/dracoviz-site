import React, { useState, useEffect } from 'react';
import '../css/fonts.css'; // Adjust the path as needed
// import qrcode from 'qrcode';
import { getPokemonURLName } from '../utils/profile-roster-utils';
import pokemonJson from '../../public/pokemon.json';

function loadImage(url, callback) {
  const img = new Image();
  img.crossOrigin = 'anonymous'; // Enable cross-origin requests if needed

  img.onload = () => callback(null, img);
  img.onerror = (error) => callback(error, null);
  img.src = url;
}

function generateImage(profile, season, callback) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1500;
  canvas.className = 'profile-image';
  const context = canvas.getContext('2d');

  // Load the background image
  const backgroundImage = new Image();
  backgroundImage.crossOrigin = 'anonymous';
  backgroundImage.src = 'https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/02d7deed-24ae-4112-bc01-e36b20bd9900/public';

  // // Generate the QR code for the profile URL
  // const profileUrl = `https://www.dracoviz.com/profile/${profile.name}`;
  // const qrCodeSize = 300; // Adjust the size as needed

  // Create a canvas element for the QR code
  // const qrCodeCanvas = document.createElement('canvas');
  // qrCodeCanvas.width = qrCodeSize;
  // qrCodeCanvas.height = qrCodeSize;
  // const qrCodeContext = qrCodeCanvas.getContext('2d');

  backgroundImage.onload = function () {
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

    //  profile.name = "O______________O"
    let textWidth = context.measureText(profile.name).width;

    // Calculate the x-coordinate to center the text
    let x = (canvas.width - textWidth) / 2;

    // Draw the username
    context.fillStyle = 'white';
    context.fillText(profile.name, x, 115);

    context.font = '60px MyFont';

    // Draw a white line under the username

    // Define the coordinates for the four vertices of the parallelogram
    let x1 = 0;
    let y1 = 200;
    let x2 = 400;
    let y2 = 200;
    let x3 = 400;
    let y3 = 255;
    let x4 = 0;
    let y4 = 255;

    // Draw the parallelogram
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.lineTo(x4, y4);
    context.closePath(); // Close the path to form a closed shape
    context.fillStyle = 'white'; // Set the fill color
    context.fill(); // Fill the shape

    // context.font = '35px MyFont';
    // const lineWidth = textWidth + 20;
    // context.fillRect(x - 10, 150, lineWidth, 5);

    context.font = '40px MyFont';
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

    // Draw the parallelogram
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.lineTo(x4, y4);
    context.closePath(); // Close the path to form a closed shape
    context.fillStyle = 'white'; // Set the fill color
    context.fill(); // Fill the shape

    context.font = '40px MyFont';
    context.fillStyle = '#1F1F21';
    textWidth = context.measureText(`${season} SEASON`).width;
    x = (canvas.width - textWidth) / 2;
    context.fillText(`${season} SEASON`, 35, 242);
    context.fillStyle = 'white';

    const championshipImage = new Image();
    championshipImage.onload = function () {
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

    const filteredTournaments = profile.tournaments.filter(
      (tournament) => tournament.tournament.toLowerCase().includes(season),
    );
    const isBig = filteredTournaments.length > 5;
    if (profile.tournaments && profile.tournaments.length > 0) {
      let yOffset = isBig ? 300 : 350; // Initialize yOffset for the first tournament
      let isRight = false;

      const processTournament = (tournamentIndex) => {
        if (tournamentIndex >= profile.tournaments.length) {
          // All tournaments have been processed, call the callback
          callback(null, canvas.toDataURL('image/png'));
          return;
        }

        const tournament = profile.tournaments[tournamentIndex];
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
        const tournamentStats = `${tournament.date}   ${
          ordinal_suffix_of(parseInt(tournament.final_rank, 10))
        }   ${parseInt(tournament.match_wins, 10)}-${parseInt(tournament.match_losses, 10)
        } (${parseInt(tournament.game_wins, 10)}-${parseInt(tournament.game_losses, 10)})`;

        context.font = '30px MyFont';

        textWidth = context.measureText(tournamentStats).width;
        centerX = !isBig ? (canvas.width - textWidth) / 2 : (isRight ? 600 : 75) + 50;
        context.fillText(tournamentStats, centerX, yOffset + 145);

        // Draw the roster images for this tournament
        const { roster } = tournament; // Assuming each tournament has a roster array

        if (roster && roster.length > 0) {
          const maxRosterPerRow = 6; // Maximum number of roster images per row
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
            const imageUrl = `https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${pokemonJsonSid.sid}.png/public`;
            // const imageUrl = `https://img.pokemondb.net/sprites/go/normal/${getPokemonURLName(pokemon)}.png`;

            loadImage(imageUrl, (error, image) => {
              if (error) {
                console.error('Error loading image:', error);
                return;
              }

              // Calculate the total width of the roster images when isBig is false
              let totalRosterWidth = roster.length * 64; // Assuming each image has a width of 70

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
                const zoomFactor = 0.14; // Adjust the zoom factor as needed
                const zoomedWidth = image.width * zoomFactor;
                const zoomedHeight = image.height * zoomFactor;
                context.drawImage(
                  image,
                  imageX + (34 - zoomedWidth / 2),
                  yOffset + (80 - zoomedHeight / 2),
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
      context.drawImage(dracovizImage, (canvas.width - 300) / 2, canvas.height - 150, 300, 63);
    };
    championshipImage.crossOrigin = 'anonymous';
    dracovizImage.crossOrigin = 'anonymous';
    championshipImage.src = 'https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/373dbe60-952c-4bdf-009a-0db41ab3b600/public';
    dracovizImage.src = 'https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/43a7cc83-6e97-4b34-40cc-abcdc6a83f00/public';
  };
}

function GenerateLocalImage({ profile, season }) {
  if (profile === undefined) {
    return null;
  }
  const [imageUrl, setImageUrl] = useState('');

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
        <a href={imageUrl} download={`dracoviz-profile-${profile.name}`}>
          <img
            style={{
              marginBottom: 10, maxWidth: 560, width: '100%', objectFit: 'contain',
            }}
            src={imageUrl}
            alt="Player Performance"
          />
          <br />
          <button type="button" className="btn btn-primary">Download Image</button>
        </a>
      )}
    </div>
  );
}

export default GenerateLocalImage;
