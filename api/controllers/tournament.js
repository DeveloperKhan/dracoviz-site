// File: students.js
import TMPlayer from '../models/tmplayers';
import TMMatch from '../models/tmmatch';


export function getTournament( req, res ) {
    const tm = req.query.tm
    try {
        TMPlayer.find({'tournament': tm}, function(err, users) {
            res.json(users);
        });
    }
    catch (ex) {
        res.status(401).json({ error: "Invalid" });
    }
}

export function getMatches( req, res ) {
    const tm = req.query.tm
    try {
        TMMatch.find({'tournament': tm}, function(err, matches) {
            res.json(matches);
        });
    }
    catch (ex) {
        res.status(401).json({ error: "Invalid" });
    }
}