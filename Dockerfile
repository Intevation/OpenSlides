FROM python:3.5
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get install -y libpq-dev supervisor curl vim zip libxmlsec1-dev
RUN useradd -m openslides

## BUILD JS STUFF
RUN wget https://nodejs.org/dist/v10.5.0/node-v10.5.0-linux-x64.tar.xz -P /tmp && \
  cd /tmp && tar xfvJ node-v10.5.0-linux-x64.tar.xz && \
  ln -sf /tmp/node-v10.5.0-linux-x64/bin/node /usr/bin/node
RUN mkdir /app
WORKDIR /app
COPY . /app
RUN chown -R openslides /app
USER openslides
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN $HOME/.yarn/bin/yarn --non-interactive
RUN node_modules/.bin/gulp --production

# INSTALL PYTHON DEPENDENCIES
USER root
RUN pip install -r /app/requirements_big_mode.txt

# SAML plugin
RUN pip install python3-saml
USER openslides
RUN wget https://github.com/Intevation/openslides-saml/archive/add-delegate-group.zip -P $HOME
RUN cd $HOME && unzip add-delegate-group.zip && cd openslides-saml-add-delegate-group && $HOME/.yarn/bin/yarn --non-interactive
USER root
RUN cp -r /home/openslides/openslides-saml-add-delegate-group/openslides_saml /app/
RUN rm -r /home/openslides/add-delegate-group.zip /home/openslides/openslides-saml-add-delegate-group/

## Clean up
RUN apt-get remove -y python3-pip wget curl
RUN rm -rf /var/lib/apt/lists/* && \
  rm -fr /app/bower_components && \
  rm -fr /app/node_modules

RUN mkdir /data && chown openslides /data
USER openslides
EXPOSE 8000
VOLUME /supervisord.conf
VOLUME /data
