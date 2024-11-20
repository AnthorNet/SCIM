/* global collectableMarkers, Intl */
export default class Modal_Map_Collectables
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
    }

    parse()
    {
        $('#statisticsModalCollectables').empty();

        let html                = [];
        let playerCollectables  = this.baseLayout.collectablesSubSystem.get();

        html.push('<table class="table mb-0">');

        for(let className in playerCollectables)
        {
            let currentItem = playerCollectables[className];
                if(currentItem.markers !== undefined)
                {
                    html.push('<tr>');
                    html.push('<td width="74"><img src="' + currentItem.image + '" class="img-fluid img-thumbnail" /></td>');
                    html.push('<td><table class="table table-borderless table-sm mb-0">');
                    html.push('<tr>');
                    html.push('<td>' + currentItem.name + '</td>');

                    html.push('<td class="text-right" width="20%">');
                    if((currentItem.needDiscovery !== undefined && currentItem.needDiscovery === true && currentItem.discovered !== undefined && currentItem.discovered < currentItem.markers.length))
                    {
                        html.push(new Intl.NumberFormat(this.baseLayout.language).format(currentItem.used) + ' / ' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.discovered) + ' (Total: ' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.markers.length) + ')');
                    }
                    else
                    {
                        html.push(new Intl.NumberFormat(this.baseLayout.language).format(currentItem.used) + ' / ' + new Intl.NumberFormat(this.baseLayout.language).format(currentItem.markers.length));
                    }
                    html.push('</td>');

                    html.push('<td class="text-right" width="20%">');
                    if(currentItem.used > 0)
                    {
                        html.push('<button class="btn btn-danger btn-sm resetCollectables" data-id="' + className + '">Reset</button>');
                    }
                    if((currentItem.markers.length - currentItem.used) > 0)
                    {
                        html.push('<button class="btn btn-success btn-sm clearCollectables" data-id="' + className + '">Clear</button>');
                    }
                    html.push('</td>');

                    html.push('</tr>');
                    html.push('<tr>');
                    html.push('<td colspan="3" class="pt-0"><div class="progress"><div class="progress-bar bg-success" style="width: ' + (currentItem.used / currentItem.markers.length * 100) + '%"></div></div></td>');
                    html.push('</table></td>');
                    html.push('</tr>');
                }
        }

        html.push('</table>');

        $('#statisticsModalCollectables').html(html.join(''));

        $('.resetCollectables').on('click', (e) => {
            let currentClassName = $(e.currentTarget).attr('data-id');
                $(e.currentTarget).parent().html('<i class="fas fa-cog fa-spin"></i>');
                window.requestAnimationFrame(() => {
                    this.baseLayout.collectablesSubSystem.resetAll(currentClassName);
                    return this.parse();
                });
        });

        $('.clearCollectables').on('click', (e) => {
            let currentClassName = $(e.currentTarget).attr('data-id');
                $(e.currentTarget).parent().html('<i class="fas fa-cog fa-spin"></i>');
                window.requestAnimationFrame(() => {
                    this.baseLayout.collectablesSubSystem.clearAll(currentClassName);
                    return this.parse();
                });
        });
    }
}