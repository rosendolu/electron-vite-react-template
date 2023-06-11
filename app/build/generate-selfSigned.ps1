# $params = @{
#     DnsName = 'localhost', 'localhost'
#     CertStoreLocation = 'Cert:\LocalMachine\My'
# }
# New-SelfSignedCertificate @params


# windows 系统下生成签名证书

$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation 'Cert:\LocalMachine\My'

$password = ConvertTo-SecureString -String "zhoubindaydayup" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "C:\Users\rosen\cert\certificate.pfx" -Password $password