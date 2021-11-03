const novoElemento = (tagName, className) => {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira (reversa = false){
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo: borda)
    this.elemento.appendChild(reversa ? borda: corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`    
}

function ParDeBarreiras(altura, abertura, distanciaEixoX){
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = _ => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getDistanciaEixoX = _ => parseInt(this.elemento.style.left.split('px')[0])
    this.setDistanciaEixoX = distanciaEixoX => this.elemento.style.left = `${distanciaEixoX}px`
    this.getLargura = _ => this.elemento.clientWidth

    this.sortearAbertura()
    this.setDistanciaEixoX(distanciaEixoX)
}      

function Barreiras(altura, largura, abertura, espaco, atualizarPontos){
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3),
    ]

    const deslocamento = 3
    this.animar = _ => {
        this.pares.forEach(par => {
            par.setDistanciaEixoX(par.getDistanciaEixoX() - deslocamento)
            
            // quando o elemento sair da área do jogo
            if(par.getDistanciaEixoX() < -par.getLargura()){
                par.setDistanciaEixoX(par.getDistanciaEixoX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getDistanciaEixoX() + deslocamento >= meio
                && par.getDistanciaEixoX() < meio
            if(cruzouOMeio) {
                console.log('Cruzou')
                atualizarPontos()
            }
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = './imgs/passaro.png'

    this.getY = _ => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = _ => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMax = this.alturaJogo - this.elemento.clientHeight
        
        if(novoY <= 0){
            this.setY(0)
        }

        else if(novoY >= alturaJogo){
            this.setY(alturaMax)
        }
    
        else{
            this.setY(novoY)        
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')

    this.atualizarPontos = ponto => {
        this.elemento.innerHTML = ponto
    }
    
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false

    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
        
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior) 
        }
    })
    return colidiu
}

function PlayCard(){
    this.elemento = novoElemento('div', 'play')
    this.elemento.innerHTML = '<h2>Clique para Começar !</h2>'
    
    this.btnPlay = novoElemento('button', 'btn')
    this.btnPlay.innerHTML = '<i class="fas fa-play"></i>'
    
    this.elemento.appendChild(this.btnPlay)
}

function reload(btn){
    btn.onclick = e =>{
        e.preventDefault()
        document.location.reload(true);
    }
}

function FlappyBird(){
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const height = areaDoJogo.clientHeight
    const width = areaDoJogo.clientWidth

    // const reloadCard = new ReloadCard()
    const playCard = new PlayCard()

    const progresso = new Progresso()
    const barreiras = new Barreiras(height, width, 200, 400, () => {
        progresso.atualizarPontos(++pontos)
    })
    const passaro = new Passaro(height)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => {
        areaDoJogo.appendChild(par.elemento)
    })
    
    this.start = _ => {
        //loop do jogo 
        const temporizador = setInterval(_ => {
            barreiras.animar()
            passaro.animar()    
            
            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador)
        
                playCard.elemento.innerHTML = '<h2>Deseja Continuar ?</h2>'
                playCard.btnPlay.src =  '#'
                playCard.btnPlay = novoElemento('a', 'btn')
                playCard.btnPlay.innerHTML = '<i class="fas fa-redo-alt"></i>'
                playCard.elemento.appendChild(playCard.btnPlay)
                playCard.elemento.style.display="flex"
                reload(playCard.btnPlay)
            }
        }, 20)
    }

    areaDoJogo.appendChild(playCard.elemento)

    playCard.btnPlay.onclick = e =>{
        e.preventDefault()
        playCard.elemento.style.display="none"
        this.start()
    }
}

const game = new FlappyBird()



