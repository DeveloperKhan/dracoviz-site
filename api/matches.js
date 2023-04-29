import TMMatch from './models/tmmatch';

function handler( req, res ) {
    const tm = req.query.tm
    try {
        TMMatch.find({'tournament': tm}, function(err, matches) {
            res.status(200).json(matches);
        });
    }
    catch (ex) {
        res.status(401).json({ error: `Invalid query of tm=${tm}` });
    }
}

export default handler;
