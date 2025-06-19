import './App.css';

import Main from './pages/Main/Main'
import Profile from './pages/Profile/Profile';
import Group from './pages/Group/Group';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import CreateGroup from './pages/CreateGroup/CreateGroup';
import EditGroup from './pages/EditGroup/EditGroup';
import CreatePost from './pages/CreatePost/CreatePost';
import Header from './component/Header/Header';

import AppRouter from './component/AppRouter';

import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      
        <Header/>
        <AppRouter/>
        {/* <CreatePost/> */}
        {/* <Register/> */}
        {/* <Login/> */}
        {/* <EditGroup/> */}
        {/* <CreateGroup/> */}
        {/* <Group/> */}
        {/* <Profile/> */}
        {/* <Main/> */}
      </BrowserRouter>
    </div>
  );
}

export default App;
