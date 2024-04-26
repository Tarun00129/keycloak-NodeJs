exports.getUserExtras = (req, res) => {
    res.json({ message: 'User extras retrieved successfully', user: req.user });
};

exports.updateUserAvatar = (req, res) => {
    const { avatar } = req.body;
    res.json({ message: 'Avatar updated successfully', avatar });
};

exports.createComment = (req, res) => {
    const { text } = req.body;
    res.json({ message: 'Comment created successfully', text });
};
