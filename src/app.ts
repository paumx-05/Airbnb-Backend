import express from 'express'
const app = express()
const port = 3333

app.get('/items/articulo1', (req, res) => {
  res.send('Aqui tienes la informacion del artiuclo 1')
})

app.listen(port, () => {
  console.log(`Listo para usar en http://localhost:${port}`)
})
 