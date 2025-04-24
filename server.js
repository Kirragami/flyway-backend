const jsonServer = require('json-server');
const auth = require('json-server-auth');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const bcrypt = require('bcryptjs');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use(auth);

server.db = router.db;

server.post('/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body || {};
    if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({
        message: 'Email, currentPassword and newPassword are required.'
    });
}


const user = server.db
    .get('users')
    .find({ email })
    .value();

if (!user) {
    return res.status(404).json({ message: 'User not found.' });
}
// if (user.password !== currentPassword) {
//     return res.status(400).json({ message: 'Invalid current password.' });
// }

const isMatch = await bcrypt.compare(currentPassword, user.password);
if (!isMatch) {
    return res.status(400).json({ message: 'Invalid current password.' })
}

const hashedNew = await bcrypt.hash(newPassword, 10);

server.db
    .get('users')
    .find({ email })
    .assign({password: hashedNew})
    .write();

return res.status(200).json({ message: 'Password updated successfully.' });
});

server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});