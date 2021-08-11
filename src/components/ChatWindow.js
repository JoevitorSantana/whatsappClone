import React, {useState, useEffect, useRef} from 'react';
import './ChatWindow.css';
import SearchIcon from '@material-ui/icons/Search';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import CloseIcon from '@material-ui/icons/Close';
import SendIcon from '@material-ui/icons/Send';
import MicIcon from '@material-ui/icons/Mic';
import EmojiPicker from 'emoji-picker-react';
import MessageItem from './MessageItem';
import Api from '../Api';

export default({user, data}) => {

    const body = useRef();    

    let recognition = null;

    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if(SpeechRecognition !== undefined){
        recognition = new SpeechRecognition();
    }
    const [text, setText] = useState('');

    const handleEmojiClick = (e, emojiObject) => {
        setText(text + emojiObject.emoji);
    }
    const [emojiOpen, setEmojiOpen] = useState(false);

    const handleOpenEmoji = () => {
        setEmojiOpen(true);
    }
    const handleCloseEmoji = () => {
        setEmojiOpen(false);
    }
    const [listening, setListening] = useState(false);
    const [list, setList] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() =>{
        if(body.current.scrollHeight > body.current.offsetHeight) {
            body.current.scrollTop = body.current.scrollHeight - body.current.offsetHeight;
        }
    }, [list]);

    useEffect(() => {
        setList([]);
        let unsub = Api.onChatContent(data.chatId, setList, setUsers);
        return unsub;
    }, [data.chatId]);

    const handleMicClick = () => {
        if(recognition !== null) {
            recognition.onstart = () =>{
                setListening(true);
            }
            recognition.onend = () => {
                setListening(false);
            }
            recognition.onresult = (e) => {
                setText(e.results[0][0].transcript);
            }
            recognition.start();
        }
    }
    const handleSendClick = () =>{
        if(text !== '') {
            Api.sendMessage(data, user.id, 'text', text, users);
            setText('');
            setEmojiOpen(false);
        }
    }
    const handleInputKeyUp = (e) => {        
        if(e.keyCode == 13) {
            handleSendClick();
        }
    }
    return(
        <div className="chatWindow">
            <div className="chatWindow--header">
                <div className="chatWindow--headerinfo">
                    <img className="chatWindow--avatar" src={data.image}/>
                    <div className="chatWindow--name">{data.title}</div>
                </div>
                <div className="chatWindow--headerbuttons">
                    <div className="chatWindow--btn">
                        <SearchIcon style={{color: '#919191'}}/>
                    </div>
                    <div className="chatWindow--btn">
                        <AttachFileIcon style={{color: '#919191'}}/>
                    </div>
                    <div className="chatWindow--btn">
                        <MoreVertIcon style={{color: '#919191'}}/>
                    </div>
                </div>
            </div>
            <div ref={body} className="chatWindow--body">
                {list.map((item, key)=>(
                    <MessageItem 
                        key={key}
                        data={item}
                        user={user}
                    />                   
                ))}
            </div>
            <div className="chatWindow--emojiarea" style={{height:emojiOpen?'200px':'0px'}}>
                <EmojiPicker                     
                    disableSearchBar
                    disableSkinTonePicker
                    onEmojiClick={handleEmojiClick}                    
                />
            </div>
            <div className="chatWindow--footer">
                <div className="chatWindow--pre">
                    <div 
                        className="chatWindow--btn"
                        style={{width: emojiOpen?40:0}}
                        onClick={handleCloseEmoji}
                    >
                        <CloseIcon style={{color: '#919191'}}/>

                    </div>
                    <div 
                        className="chatWindow--btn"
                        onClick={handleOpenEmoji}
                    >
                        <InsertEmoticonIcon 
                            style={{color: emojiOpen?'#009688':'#919191'}}                            
                        />
                    </div>
                </div>
                <div className="chatWindow--inputarea">
                    <input 
                        className="chatWindow--input" 
                        type="text" 
                        placeholder="Digite uma mensagem"
                        value={text}
                        onChange={e=>setText(e.target.value)}
                        onKeyUp={handleInputKeyUp}
                    />
                </div>
                <div className="chatWindow--pos">
                    {text === '' &&
                        <div onClick={handleMicClick} className="chatWindow--btn">
                            <MicIcon style={{color: listening? '#126ece' : '#919191'}}/>
                        </div>
                    }
                    {text !== '' &&
                        <div onClick={handleSendClick} className="chatWindow--btn">
                            <SendIcon style={{color: '#919191'}}/>
                    </div>
                    }                    
                </div>
            </div>
        </div>
    );
}