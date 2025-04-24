// Importar rutas
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const capitulo3Router = require('./routes/capitulo3');

// Configurar rutas
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/capitulo3', capitulo3Router); 