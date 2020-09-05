const find = document.querySelector.bind(document)

const start = () => {
  const baseUrl = 'https://api.github.com'
  const inputUsuario = find('.input-usuario')
  const buttonBuscar = find('.buscar-button')
  const buttonVoltar = find('.button-voltar')
  const sectionUsuario = find('#usuario')
  const sectionRepositorios = find('#repositorios')
  const conteudoRepositorios = find('.conteudo-repositorios')


  const usuario = {
    login: '',
    repositorios: ''
  }

  const buscarUsuario = async () => {

    if (inputUsuario.value === '') {
      return
    }

    voltar()

    try {

      const response = await fetch(`${baseUrl}/users/${inputUsuario.value}`)

      if (response.status === 200) {
        const data = await response.json()
        usuario.login = data.login,
          usuario.repositorios = data.public_repos
        renderizaUsuario(data)
      }
      else {
        alert('Usuário não encontrado')
      }
    } catch (error) {
      alert('Erro, não foi possivel buscar o usuário, tente novamente')
    }
  }

  const paginacao = () => {
    const estado = {
      pagina: 1,
      totalPaginas: Math.ceil(usuario.repositorios / 10),
      maximoBotoesVisiveis: 5
    }

    const atualizaEstado = () => {
      estado.pagina = 1
      estado.totalPaginas = Math.ceil(usuario.repositorios / 10)
      atualiza()
    }
    const controles = {
      proximo() {
        estado.pagina++

        const ultimaPagina = estado.pagina > estado.totalPaginas

        if (ultimaPagina) {
          estado.pagina--
        }

      },
      anterior() {
        estado.pagina--

        if (estado.pagina < 1) {
          estado.pagina++
        }

      },
      vaPara(pagina) {

        if (pagina < 1) {
          pagina = 1
        }

        estado.pagina = pagina

        if (pagina > estado.totalPaginas) {
          estado.pagina = estado.totalPaginas
        }
      },


      criarEventos() {

        find('.primeiro').addEventListener('click', () => {
          controles.vaPara(1)
          atualiza()
        })

        find('.ultimo').addEventListener('click', () => {
          controles.vaPara(estado.totalPaginas)
          atualiza()
        })

        find('.proximo').addEventListener('click', () => {
          controles.proximo()
          atualiza()
        })

        find('.anterior').addEventListener('click', () => {
          controles.anterior()
          atualiza()
        })
      }


    }

    const buttonsPagina = {
      elemento: find('.numeros'),

      atualiza() {
        buttonsPagina.elemento.innerHTML = ''
        const { esquerdaMaxima, direitaMaxima } = buttonsPagina.botoesVisiveis()

        for (let pagina = esquerdaMaxima; pagina <= direitaMaxima; pagina++) {
          buttonsPagina.criaBotoes(pagina)
        }
      },
      criaBotoes(numero) {
        const botao = document.createElement('button')

        botao.innerHTML = numero

        if (estado.pagina == numero) {
          botao.classList.add('pagina-atual')
        }

        botao.addEventListener('click', () => {
          controles.vaPara(numero)
          atualiza()
        })

        buttonsPagina.elemento.appendChild(botao)
      },


      botoesVisiveis() {
        const { maximoBotoesVisiveis } = estado
        let esquerdaMaxima = (estado.pagina - Math.floor(maximoBotoesVisiveis / 2))
        let direitaMaxima = (estado.pagina + Math.floor(maximoBotoesVisiveis / 2))


        if (esquerdaMaxima < 1) {
          esquerdaMaxima = 1
          direitaMaxima = maximoBotoesVisiveis
        }

        if (direitaMaxima > estado.totalPaginas) {
          esquerdaMaxima = estado.totalPaginas - (maximoBotoesVisiveis - 1)
          if (esquerdaMaxima < 1) {
            esquerdaMaxima = 1
          }
          direitaMaxima = estado.totalPaginas;
        }
        return { esquerdaMaxima, direitaMaxima }
      }
    }

    const atualiza = () => {
      buscarRepositorios(estado.pagina)
      buttonsPagina.atualiza()
    }

    controles.criarEventos()
    buttonsPagina.atualiza()

    return atualizaEstado
  }

  const paginacaoTeste = paginacao()

  const renderizaRepositorio = (data) => {

    const cards = data.map(item => (`
      <a href="${item.link}" class="card">
        <label class="card-titulo">${item.nome}</label>
        <label class="card-descricao">${item.descricao}</label>
        <div class="separador-card">
          <div>
            <div class="circulo"></div>
            <label class="card-linguagem">${item.linguagem}</label>
          </div>

          <div>
            <img class="star" src="svgs/star.svg">
            <label class="card-linguagem">${item.estrelas}</label>
          </div>

          <div>
            <img class="fork" src="svgs/fork.svg">
            <label class="card-linguagem">${item.forks}</label>
          </div>
        </div>
      </a>
    `))
    conteudoRepositorios.innerHTML = cards.join("")
    
  }

  const buscarRepositorios = async (page) => {
    try {
      const response = await fetch(`${baseUrl}/users/${usuario.login}/repos?page=${page}&per_page=10`)
      if (response.status === 200) {
        const dataResponse = await response.json()
        const dataArray = [...dataResponse]
        const data = dataArray.map(repositorio => (
          {
            nome: repositorio.name,
            descricao: repositorio.description ? repositorio.description : 'Sem descrição...',
            linguagem: repositorio.language ? repositorio.language : 'Linguagem não informada',
            estrelas: repositorio.stargazers_count,
            forks: repositorio.forks,
            link: repositorio.html_url
          }
        ))

        renderizaRepositorio(data)
      }
      else {
        alert('Repositórios não encontrados')
      }

    } catch (error) {
      alert('Erro, não foi possivel buscar os Repositórios')
    }

  }

  const visualizarRepositorio = () => {
    sectionUsuario.style.display = "none"
    sectionRepositorios.style.display = "flex"
    paginacaoTeste()
    buscarRepositorios(1)
  }

  const voltar = () => {
    sectionUsuario.style.display = "flex"
    sectionRepositorios.style.display = "none"
  }

  const renderizaUsuario = (data) => {
    sectionUsuario.innerHTML = `
      <div class="avatar">
        <img src="${data.avatar_url}" class="avatar-usuario">
        <div class="dados-botao">
          <button class="button-repositorio">Ver Repositórios</button>
        </div>
      </div>
      <div class="dados-usuario">
        <div class="dados-grupo">
          <div class="dados-titulo">ID:</div>
          <div class="dados-descricao">${data.id}</div>
        </div>
        <div class="dados-grupo">
          <div class="dados-titulo">Nome:</div>
          <div class="dados-descricao">${data.name}</div>
        </div>
        <div class="dados-grupo">
          <div class="dados-titulo">Empresa:</div>
          <div class="dados-descricao">${data.company}</div>
        </div>
        <div class="dados-grupo">
          <div class="dados-titulo">Localização:</div>
          <div class="dados-descricao">${data.location}</div>
        </div>
        

        <div class="dados-grupo">
          <div class="dados-titulo">Repositórios:</div>
          <div class="dados-descricao">${data.public_repos}</div>
        </div>
        <div class="dados-grupo">
          <div class="dados-titulo">Seguidores:</div>
          <div class="dados-descricao">${data.followers}</div>
        </div>
        <div class="dados-grupo">
          <div class="dados-titulo">Seguindo:</div>
          <div class="dados-descricao">${data.following}</div>
        </div>
        <div class="dados-grupo">
          <div class="dados-titulo">GitHub:</div>
          <div class="dados-descricao"><a href="${data.html_url}">${data.html_url}</a></div>
        </div>
      </div>
      <div class="dados-sobre">
          <div class="sobre-titulo">Sobre:</div>
          <div class="sobre-descricao">${data.bio}</div>
      </div>

    `
    const buttonRepositorio = find('.button-repositorio')
    buttonRepositorio.addEventListener("click", visualizarRepositorio)
  }


  const enter = (event) => {
    if (event.keyCode === 13) {
      buscarUsuario()
    }
  }

  inputUsuario.addEventListener("keyup", enter)
  buttonBuscar.addEventListener("click", buscarUsuario)
  buttonVoltar.addEventListener("click", voltar)

  inputUsuario.value = 'rene3dm'

  buttonBuscar.click()
}

start()


