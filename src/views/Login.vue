<template>
    <div class="loginpanel">
        <div class="container">
            <div class="container-forms">
                <div class="container-info">
                    <div class="info-item">
                        <div class="table">
                            <div class="table-cell">
                                <p>
                                    你有帐户吗?
                                </p>
                                <button class="info-btn">
                                    登 录
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="table">
                            <div class="table-cell">
                                <p>
                                    没有账号快来注册啊?
                                </p>
                                <button class="info-btn">
                                    注 册
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="container-form">
                    <div class="form-item log-in">
                        <div class="table">
                            <div class="table-cell">
                                <input type="text" name="Username" placeholder="用户名">
                                <input type="password" name="Password" placeholder="密码">
                                <button class="btn"> 
                                    登 录
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="form-item sign-up">
                        <div class="table">
                            <div class="table-cell">
                                <input type="text" name="email" placeholder="邮箱">
                                <input type="text" name="fullName" placeholder="全名">
                                <input type="text" name="Username" placeholder="用户名">
                                <input type="password" name="Password" placeholder="密码">
                                <button class="btn"> 
                                    登 录
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    const info_btn = document.getElementsByClassName("info-btn")
for (let i = 0; i < info_btn.length; i++) {
  info_btn[i].onclick = () => {
    document.querySelector(".container").classList.toggle("log-in");
  }; 
}
</script>
<style>
@import url(https://fonts.googleapis.com/css?family=Oswald|Roboto);
.loginpanel{
    /* 绝对定位    */
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    font-family: "Roboto",sans-serif;
    background-color: #fff4e6;
    /* 溢出隐藏 */
    overflow: hidden;
}

.table{
    display: table;
    width: 100%;
    height: 100%;
}

.table-cell{
    display: table-cell;
    vertical-align: middle;
    transition: all 0.5s;
}

.container{
    /* 相对定位 */
    position: relative;
    width: 600px;
    margin: 30px auto 0;
    height: 320px;
    background-color: #854442;
    top: 50%;
    margin-top: -160px;
    transition: all 0.5s;
}

.btn , .info-btn{
    display: block;
    border: none;
    text-align: center;
    margin: 0 auto;
    color: #fff;
    background-color: #be9b7b;
}
.info-btn{
    padding: 5px 10px;
}

.btn:hover{
    opacity: 0.7;
}
.btn ,input{
    padding: 10px 15px;
}

input{
    margin: 0 auto 15px;
    display: block;
    width: 220px;
}

.container-info{
    font-size: 0;
}

.info-item{
    text-align: center;
    width: 300px;
    height: 320px;
    display: inline-block;
    color: #fff;
}

.info-item p{
    font-size: 20px;
    margin: 20px;
}

.info-item .btn{
    background-color: transparent;
    border: 1px solid #fff;
}

.info-item .table-cell{
    padding-right: 35px;
}
.info-item:nth-child(2) .table-cell{
    padding-left: 35px;
    padding-right: 0;
}

.container-form{
    /* 溢出隐藏 */
    overflow: hidden;
    position: absolute;
    left: 30px;
    top: -30px;
    width: 305px;
    height: 380px;
    background-color: #fff;
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.2);
    transition: all 0.5s;
}

.container-form .btn{
    margin-top: 30px;
}

.form-item{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 1;
    transition: all 0.5s;
}

.form-item.sign-up{
    position: absolute;
    left: -100%;
    opacity: 0;
}
.container.log-in .container-form{
    left: 265px;
}


.container.log-in .container-form .form-item.sign-up{
    left: 0;
    opacity: 1;
}

.container.log-in .container-form .form-item.log-in{
    top: -100%;
    opacity: 1;
}
</style>
