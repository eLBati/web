from odoo.http import request, Controller, route


class PWA(Controller):

    def get_asset_urls(self, asset_xml_id):
        qweb = request.env['ir.qweb'].sudo()
        assets = qweb._get_asset_nodes(asset_xml_id, {}, True, True)
        urls = []
        for asset in assets:
            if asset[0] == 'link':
                urls.append(asset[1]['href'])
            if asset[0] == 'script':
                urls.append(asset[1]['src'])
        return urls

    @route('/service-worker.js', type='http', auth="public")
    def service_worker(self):
        qweb = request.env['ir.qweb'].sudo()
        urls = []
        urls.extend(self.get_asset_urls("web.assets_common"))
        urls.extend(self.get_asset_urls("web.assets_backend"))
        version_list = []
        for url in urls:
            version_list.append(url.split('/')[3])
        cache_version = '-'.join(version_list)
        mimetype = 'text/javascript;charset=utf-8'
        content = qweb.render('web_pwa.service_worker', {
            'pwa_cache_name': cache_version,
            'pwa_files_to_cache': urls,
        })
        return request.make_response(content, [('Content-Type', mimetype)])

    @route('/web_pwa/manifest.json', type='http', auth="public")
    def manifest(self):
        qweb = request.env['ir.qweb'].sudo()
        config_param = request.env['ir.config_parameter'].sudo()
        pwa_name = config_param.get_param("pwa.manifest.name", "Odoo PWA")
        pwa_short_name = config_param.get_param("pwa.manifest.short_name", "Odoo PWA")
        svg_icon = config_param.get_param(
            "pwa.manifest.svg_icon", "/web_pwa/static/img/icons/oca_logo.svg")
        background_color = config_param.get_param(
            "pwa.manifest.background_color", "#2E69B5")
        theme_color = config_param.get_param(
            "pwa.manifest.theme_color", "#2E69B5")
        mimetype = 'application/json;charset=utf-8'
        content = qweb.render('web_pwa.manifest', {
            'pwa_name': pwa_name,
            'pwa_short_name': pwa_short_name,
            'svg_icon': svg_icon,
            'background_color': background_color,
            'theme_color': theme_color,
        })
        return request.make_response(content, [('Content-Type', mimetype)])
