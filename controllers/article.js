const Article = require("../models/Article");
const { validate } = require("../helpers/validate");
const fs = require("fs");
const path = require("path");

const create = async (req, res) => {

    try {
        //Tomar parametros a guardar
        const params = req.body;

        //Validar datos
        try {
            validate(params);
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message: "No se pudo guardar el artículo. Hay información no válida."
            });
        };

        //Crear objeto a guardar
        const article = new Article(params);

        //Guardar articulo en base de datos
        const savedArticle = await article.save();

        return res.status(200).json({
            status: "success",
            message: "Se guardó el artículo.",
            article: savedArticle
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "No se pudo guardar el artículo."
        });
    }
}

const find = async (req, res) => {
    try {
        const howMany = req.params.howMany;
        const x = (howMany && !isNaN(howMany)) ? Math.trunc(howMany) : 0;
        //con sort, ordenamos. En este caso, es según la fecha, de forma descendente (de la más actual a la más vieja)
        let articles = await Article.find({}).sort({ date: -1 }).limit(x);
        return res.status(200).json({
            status: "success",
            message: "Se han encontrado los artículos.",
            articles: articles
        });
    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "No se han encontrado artículos."
        });
    }
};

const findOne = async (req, res) => {
    try {
        let article = await Article.findById(req.params.id);
        return res.status(200).json({
            status: "success",
            message: "Se ha encontrado el artículo.",
            article: article
        });
    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "No se ha encontrado el artículo."
        });
    }
};

const eliminate = async (req, res) => {
    try {
        let deletedArticle = await Article.findOneAndDelete({ _id: req.params.id });
        return res.status(200).json({
            status: "success",
            message: "Se ha eliminado el artículo.",
            deletedArticle: deletedArticle
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "No se pudo eliminar el artículo."
        });
    }
};

const update = async (req, res) => {
    let articleId = req.params.id;
    let params = req.body;

    //Validar datos
    try {
        validate(params);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "No se pudo editar el artículo. Hay información no válida."
        });
    };

    try {
        //`new: true` es para que devuelva el objeto actualizado 
        let updatedArticle = await Article.findOneAndUpdate({ _id: articleId }, params, { new: true });
        return res.status(200).json({
            status: "success",
            message: "Se ha editado el artículo.",
            updatedArticle: updatedArticle
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "No se pudo editar el artículo."
        });
    }
};

const uploadImage = async (req, res) => {
    if (!req.file && !req.files) {
        return res.status(404).json({
            status: "error",
            message: "Tienes que subir una imagen"
        });
    }

    let fileName = req.file.originalname;

    //extension del archivo
    let fileSplit = fileName.split("\.");
    //nos quedamos con el ultimo elemento de fileSplit, ya que es el que determina la extension (ejemplo: en hola.svg.png la extension es png y no svg)
    let fileExtension = fileSplit[fileSplit.length - 1];

    if (fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg" && fileExtension != "gif" && fileExtension != "avif" && fileExtension != "svg" && fileExtension != "webp") {
        //borramos el archivo
        fs.unlink(req.file.path, (error) => {
            return res.status(400).json({
                status: "error",
                message: "Imagen inválida"
            });
        });
    } else {
        let articleId = req.params.id;
        try {
            let updatedArticle = await Article.findOneAndUpdate({ _id: articleId }, { image: req.file.filename }, { new: true });
            return res.status(200).json({
                status: "success",
                message: "Se ha editado el artículo.",
                updatedArticle: updatedArticle,
                uploadedFile: req.file
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "No se pudo editar el artículo."
            });
        }
    }
};

const getImage = (req, res) => {
    let file = req.params.file;
    let filePath = `./images/articles/${file}`;
    fs.stat(filePath, (error, exists) => {
        if (exists) {
            return res.status(200).sendFile(path.resolve(filePath));
        } else {
            return res.status(404).json({
                status: "error",
                message: "No se pudo encontrar la imagen."
            });
        }
    });
};

const search = async (req, res) => {
    try {
        let text = req.params.text;

        //`$or` => se cumple alguna condicion
        //`$regex: text` => usar expresiones regulares en la cadena `text`
        //`$options: i` => incluye
        let articles = await Article.find({
            "$or": [
                //en `title` se incluye la cadena `text`
                { "title": { "$regex": text, "$options": "i" } },
                //en `content` se incluye la cadena `text`
                { "content": { "$regex": text, "$options": "i" } }
            ]
        })
            .sort({ date: -1 });
        let info = (articles.length >= 1) ? "Se" : "No se";
        return res.status(200).json({
            status: "success",
            message: `${info} han encontrado los artículos.`,
            articles: articles
        });
    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "No se han encontrado los artículos."
        });
    }
};

module.exports = {
    create,
    find,
    findOne,
    eliminate,
    update,
    uploadImage,
    getImage,
    search
};