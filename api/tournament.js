import TMPlayer from './models/tmplayers';

function handler( req, res ) {
    const tm = req.query.tm
    try {
        TMPlayer.find({'tournament': tm}, function(err, users) {
            res.status(200).json(users);
        });
    }
    catch (ex) {
        res.status(401).json({ error: `Invalid query of tm=${tm}` });
    }
}

export default handler;
