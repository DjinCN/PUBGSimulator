
class Weapon extends Laya.Sprite
{
    private readonly AIM_SPEED : number = 20;
    private readonly ATM_RANGE : number = 45;

    private ani : Laya.Animation;
    private shootEffect : Laya.Skeleton = null;
    private templet : Laya.Templet;

    private line : Sprite;
    private pie : Sprite;

    // 正向反向, -1 为逆时针, 1 为顺时针
    private direct : number;
    private _rota : number;

    public get rota () : number
    {
        return this._rota;
    }

    public set rota (value)
    {
        this._rota = value;
        this.ani.rotation = value;
        this.line.rotation = value;
    }

    //  角色引用
    private role : Role;

    // 瞄准线
    private spearWire : number = 0;
    public weaponId : number = 1;
    public magazine : number = -1;
    public bulletNum : number;
    public bulletType : number;
    public type : number = 0;
    public atk : number = 0;

    private aimTimer : laya.utils.Timer;
    private weaponSFX : string = "";
    public effectX : number = 0;
    public effectY : number = 0;

    constructor(role : Role, weaponData : any)
    {
        super();
        this.role = role;
        this.weaponId = weaponData.id;
        this.magazine = weaponData.magazine;

        this.aimTimer = new laya.utils.Timer();
        this.line = new Sprite();
        this.pie = new Sprite();
        this.pie.alpha = 0.5;
        
        this.ani = new Laya.Animation();
        this.ani.source = 'animation/Weapons.ani';

        this.templet = new Laya.Templet();
        this.templet.on(Laya.Event.COMPLETE, this, this.parseComplete);
        this.templet.loadAni("spine/ui_qiang.sk");

        this.rota = -this.ATM_RANGE;

        this.addChild(this.pie);
        this.addChild(this.line);
        this.addChild(this.ani);
        this.setAimVisible(false);

        this.init();
    }

    private parseComplete() : void
    {
        this.shootEffect = this.templet.buildArmature(0);
        this.shootEffect.pos(this.x + this.effectX, this.y + this.effectY);
        this.ani.addChild(this.shootEffect);
    }

    public init() : void
    {
        var weaponJson = Laya.loader.getRes("data/weapon.json");

        var weaponIdx = this.weaponId - 1;
        var size = parseFloat(weaponJson[weaponIdx].size);
        var pivotX = parseInt(weaponJson[weaponIdx].pivotX);
        var pivotY = parseInt(weaponJson[weaponIdx].pivotY);
        var piontX = parseInt(weaponJson[weaponIdx].piontX);
        var piontY = parseInt(weaponJson[weaponIdx].piontY);
        this.type = parseInt(weaponJson[weaponIdx].type);
        this.atk = parseInt(weaponJson[weaponIdx].atk);

        this.effectX = parseInt(weaponJson[weaponIdx].effectX);
        this.effectY = parseInt(weaponJson[weaponIdx].effectY);
        
        this.spearWire = parseInt(weaponJson[weaponIdx].spearWire);
        this.bulletNum = parseInt(weaponJson[weaponIdx].bulletNum);
        this.bulletType = parseInt(weaponJson[weaponIdx].bulletType);
        this.weaponSFX = Unit.formatResURL("music/" + weaponJson[weaponIdx].shootSound + ".mp3");
        
        this.line.graphics.drawLine(0, 0, this.spearWire, 0, "#FFFFFF", 2);

        this.ani.play(0, true, "weapon_" + this.weaponId);
        
        this.pie.pos(10, -40);
        this.line.pos(10, -40);
        this.ani.pivot(pivotX, pivotY);
        this.ani.pos(piontX, piontY);
        this.ani.scale(size, size);
    }

    // 更新弹夹子弹数, true 为更新成功，false为失败
    public updateMagazine() : boolean
    {
        if (this.magazine == -1)
            return true;
        else if (this.magazine == 0)
            return false;

        -- this.magazine;

        GameData.getInstance().updateWeaponData(this.weaponId, this.magazine, true);
        return true;
    }

    public playEffect() : void
    {
        if (this.shootEffect)
            this.shootEffect.play(0, false);
    }

    public playSFx() : void
    {
        laya.media.SoundManager.playSound(this.weaponSFX);
    }

    public setAimVisible(bShow : boolean) : void
    {
        this.line.visible = bShow;
        this.pie.visible = bShow;
        this.pie.graphics.clear();
    }

    public drawAiming(start : number, end : number) : void
    {
        if (this._rota <= end) 
            this.direct = 1;
        else if (this._rota >= start) 
            this.direct = -1;

        this._rota += this.direct;

        if (!this.line.visible) 
            this.line.visible = true;

        this.rota = this._rota;

        this.pie.graphics.clear();
        this.pie.graphics.drawPie(0, 0, this.spearWire, this.rota, 0, "#000000");
    }

    public startAimAt(start : number = 0, end : number = -this.ATM_RANGE) : void
    {
        this.setAimVisible(true);
        this.aimTimer.loop(this.AIM_SPEED, this, this.drawAiming, [start, end]);
    }

    public stopAimAt() : void
    {
        this.setAimVisible(false);
        this.aimTimer.clearAll(this);
    }
}