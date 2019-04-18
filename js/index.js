function loading() {
    var $loadingBox = $(".loading");
    var $current = $loadingBox.find(".current");

    var imagesData= ["img/arr.png","img/bg.png","img/canvas.png","img/contact.png","img/cube1.png","img/cube2.png","img/cube3.png","img/cube4.png","img/cube5.png","img/cube6.png","img/cubeBg.jpg"];

    //预加载图片：
    var n = 0;
    var len = imagesData.length;
    var run = function (callback){
        imagesData.forEach(function(item,i){
            var tempImg = new Image();
            tempImg.onload = function(){
                tempImg = null;
                //设置进度条的样式：要有过度动画：
                $current.css("width",((++n) / len) * 100 + "%");


                //当加载完毕之后，执行回调：关闭loading页面：
                if(n === len){
                    //如果正常加载的；要清除最长时间的那个定时器：
                    clearTimeout(delayTimer);
                    callback && callback();
                }
            };
            tempImg.src = item;
        })
    };

    //允许加载的最长时间：如果超出这个时间段，则判断加载的图片有没有加载到90%，如果没有则提示用户网速差，然后跳转到其他页面/重新加载，不能再继续加载图片资源，如果已经达到了，则执行回调：进入下一环节
    var delayTimer = null;
    var maxDelay = function(callback){
        delayTimer = setTimeout(function(){
            clearTimeout(delayTimer);
            if(n / len >= 0.9){
                $current.css("width","100%");
                callback && callback();
                console.log(111);
                return;
            }
            alert("亲，因为是上传到GitHub的，请耐心等待一下哈！");
        },10000)
    };

    //图片加载完成，关闭当前loading页面，进入下一页面：最好有1s的停留，不要立即跳转：
    var done = function(){
        var timer = setTimeout(function(){
            $loadingBox.remove();//把整个页面都删除
            clearTimeout(timer);//清除定时器；
        },1000);

    };
    return{
        init:function(){
            run(done);
            //允许加载的最长时间：
            maxDelay(done);
        }
    }
}
loading().init();


function canvas(){
    //需求：获取画布、上下文
    function slideCanvas(){
        var $cv = $(".mark > .cv");
        var canvas = $cv.get(0);//要转换为dom对象，才能执行上下文操作.
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;
        if(canvas.getContext){
            var ctx = canvas.getContext("2d");
            var img = new Image();
            img.src="img/canvas.png";
            img.onload=function(){
                draw();
            };
            //手势：
            function draw(){
                ctx.drawImage(img,0,0,canvas.width,canvas.height);

                canvas.addEventListener("touchstart",function(e){
                    e = window.event || e;
                    var touchOne = e.changedTouches[0];

                    //获取鼠标开始位置：
                    var x = touchOne.clientX - canvas.offsetLeft;
                    var y = touchOne.clientY - canvas.offsetTop;

                    ctx.globalCompositeOperation = "destination-out";

                    ctx.lineWidth = 40;
                    ctx.lineCap = "round";//画笔的两端
                    ctx.lineJoin = "round";//线与线之间交叉的样式：圆弧
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x,y);
                    ctx.lineTo(x+1,y+1);
                    ctx.stroke();//描线
                    ctx.restore();
                });


                canvas.addEventListener("touchmove",function(e){
                    e = window.event || e;
                    var touchOne = e.changedTouches[0];

                    var x = touchOne.clientX - canvas.offsetLeft;
                    var y = touchOne.clientY - canvas.offsetTop;

                    ctx.save();
                    //ctx.beginPath();不能重新开启新路径，要和上面的连在一起
                    ctx.lineTo(x,y);
                    ctx.stroke();
                    ctx.restore();
                });

                var flag = 0;
                canvas.addEventListener("touchend",function(){
                    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);


                    //获取像素点总和：
                    var allPX = imgData.width * imgData.height;

                    //遍历所有像素点，找到那些透明的：把透明的像素点累加，然后判断
                    for(var i = 0;i<allPX;i++){
                        //算法：取rbga中a的值===3、7、11、15 ===> 4*i+3
                        if(imgData.data[4*i+3] === 0){
                            flag++;
                        }
                    }
                    //透明的像素 > 总像素的一半，则自动透明：
                    if(flag >= allPX/2){
                        canvas.style.opacity = 0;
                    }
                });


                canvas.addEventListener("transitionend",function(){
                    //过渡结束后，删除canvas:
                    this.remove();


                    //画布清除后，才进入页面：
                    detailRender().init();


                    //清除画布之后，才播放音乐：并添加旋转动画
                    $(".music")[0].className = "music active";
                    mediaAudio().init();


                })
            }
        }
    }


    return {
        init:function(){
            slideCanvas();
        }
    }

}
canvas().init();


//音乐
function mediaAudio(){

    var music = $(".music");
    var song = $("#song")[0];


    //===》点击暂停/播放：
    var TogglePlay = function (){
        if(song.paused){
            this.className = "music active";
            song.play();
        }else{
            this.className = "music";
            song.pause();
        }
    };


    return {
        init:function(){

            if(music.hasClass("active")){
                song.play();
            }
            song.volume = 0.8;
            music.on("click",TogglePlay);
        }
    }
}


//每一屏：
function detailRender(){

    var swiper = null;

    var $dl  = $(".page3>dl");

    var swiperInit = function(){
        swiper = new Swiper ('.swiper-container', {
            //initialSlide:3,控制显示的屏
            direction: 'vertical',//控制滑动方向
            effect: "slide",
            loop: false,//循环

            onInit:animate,
            onTransitionEnd:animate
        })
    };

    var animate = function(swiper){
        //swiper对应上面的实例：
        var activeIn = swiper.activeIndex;//屏对应的索引
        var slideAry = swiper.slides;//数组


        //滑动到某一屏，则添加id值，其余删除id
        slideAry.forEach(function(item,index){
            if(activeIn === index){
                item.id = "page"+(index+1);
                return;
            }
            item.id = null;
        })


        //运行到第3屏的时候，实现3d折叠：makisu库
        if(activeIn === 2){
            $dl.makisu({
                selector: 'dd',
                overlap: 0.5,
                speed: 0.8
            });
            $dl.makisu('open');
        }else {//折叠
            $dl.makisu({
                selector: 'dd',
                speed: 0
            });
            $dl.makisu('close');
        }
    };
    return {
        init:function(){
            swiperInit();

        }
    }
}






//在真实的开发中，一定要设置手势事件为null，因为浏览器有默认的事件：
/*$(document).on("touchstart","touchmove","touchend",function(e){
    e = window.event || e;
    e.preventDefault();
});*/

document.body.addEventListener('touchmove', function (e) {
    e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
}, {passive: false}); //passive 参数不能省略，用来兼容ios和android



