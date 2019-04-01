class Bullet extends Laya.Sprite 
{
    private ani : Laya.Animation;

    public hp : number = 0;
    private speed : number = 0;
    private speedY : number = 0;
    private speedX : number = 0;

    private bulletId : number = 1;
    private stageRange : Rectangle;

    public owner : string = "";

    public delayShoot : number = 0;
    
    constructor() 
    {
        super();

        this.ani = new Laya.Animation();
        this.ani.source = "animation/Weapons.ani";
        this.stageRange = new laya.maths.Rectangle(0, 0, Laya.stage.width, Laya.stage.height);
    }

    public init(id : number, hp : number, rota : number, speed : number = 40) : void 
    {
        this.visible = true;
        this.hp = hp;
        this.bulletId = id;
        this.rotation = rota;
        this.speed = speed;

        this.ani.play(0, true, "bullet_" + id);

        // 弹道轨迹公式
        var radian = Math.PI / (180 / rota);
        this.speedX = Math.abs(Math.cos(radian) * this.speed);
        this.speedY = Math.abs(Math.sin(radian) * this.speed);

        var bounds : Rectangle = this.ani.getBounds();
        this.ani.size(bounds.width, bounds.height);
        this.size(bounds.width, bounds.height);

        this.addChild(this.ani);
    }

    public update() : boolean
    {
        let p = this.localToGlobal(new Point(0, 0));
        if (!this.stageRange.contains(p.x, p.y)) 
        {
            this.die();
            return true;
        }

        if (this.delayShoot > 0)
        {
            this.delayShoot --;
            return false;
        }

        if (this.owner == "hero")
        {
            if (this.scaleX < 0) 
            {
                this.x -= this.speedX;
                this.y -= this.speedY;
            }
            else 
            {
                this.x += this.speedX;
                this.y -= this.speedY;
            }
        }
        else
        {
            if (this.scaleX < 0)
            {
                this.x -= this.speedX;
                this.y += this.speedY;
            }
            else
            {
                this.x += this.speedX;
                this.y += this.speedY;
            }
        }

        return false;
    }

    public die() : void 
    {
        this.visible = false;
        this.ani.stop();
        this.ani.offAll();
        this.removeSelf();
        Pool.recover("bullet", this);
    }

}