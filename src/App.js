
import './App.css';

import io from 'socket.io-client';
import axios from 'axios';
import {useState, useEffect} from 'react'

//establecer la conexion para escuchar y enviar los eventos
const socket = io('http://localhost:4000')
const url = 'http://localhost:4000/api/'


function App() {

  const [nickname, setNickname] = useState('')
  const [disabled, setDisabled] = useState(false)

  const [message, setMessage] = useState('')
  const [messages, setMessages]= useState([])
  const [storedMessages, setStoredMessages] = useState([])
  const [fisrtTime, setFirstTime]= useState(false)


  useEffect(()=>{
    const receivedMessage = (message) =>{
      setMessages([message, ...messages])
    }
    socket.on('message', receivedMessage);

    return ()=>{
      socket.off('message', receivedMessage)
    }
  },[messages])

  if(!fisrtTime){
    axios.get(url+'messages').then(res =>{
      setStoredMessages(res.data.messages)
    } )
    setFirstTime(true)
  }

  const nicknameSubmit =(e)=>{
    e.preventDefault()
    setNickname(nickname)
    setDisabled(true)
  }
  const handlerSubmit =(e)=>{
    e.preventDefault()
    if(nickname !== ''){
      socket.emit('message',message,nickname)
      const newMessage= {
        body: message,
        from: 'Yo'
      }
      //debe llamarse igual al evento que lo escucha(colocado en el index como socket.on)
      setMessages([newMessage,...messages])
      setMessage('')//lo limpiamos para que se limpie el input

      //petidion http por post p guardar el msje en bd
      axios.post(url + 'save', {
        message: message,
        from: nickname
      })
    }else{
      alert('Para enviar un mensaje necesitas un Nick')
    }
  }
  return (
    <div className="App">
      <div className='container mt-3'>
        <div className='card'>
          <div className='card-body'>
            <h5 className='text-center'>CHAT</h5>

            {/* NickName */}

            <form onSubmit={nicknameSubmit}>
              <div className='d-flex mb-3'>
                  <input type='text' className='form-control' placeholder='Nickname' id='nickname'
                   onChange={e =>setNickname(e.target.value)} disabled={disabled}/>
                  <button className='btn btn-success mx-3' type='submit' id='btn-nickname'
                  disabled={disabled}>Establecer</button>
              </div>
            </form>
            {/* capturamos con el onchange cada caracter, pero con el onsubmit(cuanod apretamos el boton del form)
            capturamos el valor completo */}

            {/* Chat form */}

            <form onSubmit={handlerSubmit}>
              <div className='d-flex'>
                  <input type='text' className='form-control' placeholder='Mensaje' id='message'
                  onChange={e =>setMessage(e.target.value)} value={message}/>
                  <button className='btn btn-success mx-3' type='submit' id='btn-message'>Enviar</button>
              </div>
            </form>

          </div>
        </div>


        {/* Chat msg */}

        <div className='card mt-3 mb-3' id='content-chat'>
              <div className='card-body'>
                
                {messages.map((message, index)=>(
                  <div key={index} className={`d-flex p-3 ${message.from === 'Yo' ?'justify-content-end':'justify-content-start'}`}>
                    <div className={`card mb-3 border-1 ${message.from === 'Yo' ?'bg-success bg-opaity-25':'bg-light'} `}>
                      <div className='card-body'>
                        <small className=''>{message.from}: {message.body}</small>
                      </div>
                    </div>
                  </div>
                ))}
            {/* Chat stored msg */}

                        <small className='text-center text-muted'>... Mensajes Guardados...</small>
                        {storedMessages.map((message, index)=>(
                          <div key={index} className={`d-flex p-3 ${message.from === nickname ?'justify-content-end':'justify-content-start'}`}>
                            <div className={`card mb-3 border-1 ${message.from === nickname ?'bg-success bg-opaity-25':'bg-light'} `}>
                              <div className='card-body'>
                                <small className='text-muted'>{message.from}: {message.message}</small>
                              </div>
                            </div>
                          </div>
                        ))}

              </div>
        </div>
        
   

      </div>
      
    </div>
  );
}

export default App;
