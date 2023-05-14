const nodemailer = require("nodemailer");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const Player = require('../db/player');

async function sendEmail(email, token) {
  const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "",
      pass: "",
    },
  });

  transport.sendMail({
    from: "",
    to: email,
    subject: "Please confirm your account",
    html: `<h1>Email Confirmation</h1>
        <h2>Hello ${email}</h2>
        <p>Thank you for creating an account. Please confirm your email by clicking on the following link</p>
        <a href=http://localhost:3000/signup-verify/${token}> Click here</a>
        </div>`,
  }).catch(err => console.log(err));
}

async function handler(req, res) {
    const { email, password } = req.query;
  //using 'custom' x_authorization header because the regular 'authorization' header is stripped by Vercel in PROD environments.
  const { x_authorization } = req.headers
  if (x_authorization == null) {
    res.status(401).json({
      status: 401,
      message: 'Missing authorization header'
    })
    return;
  }
  const ACTION_KEY = x_authorization.split(" ")[1];
  if (ACTION_KEY !== process.env.GATSBY_SECRET_KEY) {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized'
    })
    return;
  }
  try {
    var player = await Player.find({'email': email});

    if (player !== undefined) {
      if (player.status == "Active") {
        res.status(401).json({ error: `Account already created` });
        return;
      } else if (player.status == "Pending") {
        const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const token = jwt.sign({ email: email }, "secret");
        player.confirmationCode = token;
        await player.save();
        sendEmail(email, token);

        res.status(200).json({message: "An email has been re-sent to your account."})
        return;
      }
    }

    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const token = jwt.sign({ email: email }, "secret");

    var player = new Player({
      _id: crypto.randomUUID(),
      email: email,
      password: bcrypt.hashSync(password, 10),
      confirmationCode: token
    })

    await player.save();

    sendEmail(email, token);
    
    res.status(200).json({message: "An email has been sent to your account."})
  } catch (ex) {
    res.status(401).json({ error: `Invalid query of player=${id}` });
  }
}

export default handler;
