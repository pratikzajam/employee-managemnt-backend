let fieldValidator = (req, res, next) => {
    try {
        const { name, email, position } = req.body || {}


        if (!name || !email || !position) {
            res.status(200).json({
                status: false,
                message: "name,email,position fields are  required",
                data: null
            })
        }

        next()


    } catch (error) {
        console.log(error.message)
    }
}


export default fieldValidator